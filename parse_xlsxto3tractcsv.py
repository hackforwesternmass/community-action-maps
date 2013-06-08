import csv
import urlgrabber
import xml.etree.ElementTree as ET
import xlrd

inputxlsfile='CADt2.xlsx'
outputcsvfile='tractdata.csv'


wb=xlrd.open_workbook(inputxlsfile)
sh=wb.sheet_by_index(0)

# Assumes header with column headings
nvars=sh.ncols

#in cell form
headers=sh.row(0)

col=0
varlist=[]
for vars in headers:
	varlist.append(vars.value)
	
#pull out fields:
#This could  be made more flexible...
	if vars.value == 'Address':
		addressfield=col
	elif vars.value == 'City':
		cityfield=col
	elif vars.value == 'Zip':
		zipfield=col
	elif vars.value == 'income':
		incomefield=col
	col=col+1

fipslist=[]
#skip header row, go through rest of data


#This block of code attaches FIPS to addresses 
for rownum in range(sh.nrows)[1:sh.nrows]:
	address=sh.row_values(rownum)[addressfield]+","
# Hard coding in Massachusetts!
    	city=sh.row_values(rownum)[cityfield]+", Ma"
    	zip=sh.row_values(rownum)[zipfield]
    	buildurl='http://rpc.geocoder.us/service/csv?address='+address+'+'+city+'+'+zip
# get rid of ridiculous unicode nonbreaking spaces and all spaces
	buildurl=buildurl.replace(u'\xa0', u'').replace(' ','+')
# switch type to string
	burlstr=buildurl.encode('ascii','ignore')
	out=urlgrabber.urlread(burlstr)

# If address not resolved, skip it, assign 999999 tract code:
	if out != "2: couldn't find this address! sorry":
		lat=out.split(",")[0]
		lon=out.split(",")[1]
		buildcensurl='http://data.fcc.gov/api/block/2010/find?latitude='+lat+'&longitude='+lon
		outblock=urlgrabber.urlread(buildcensurl)
		e = ET.fromstring(outblock)
		block = e.find('{http://data.fcc.gov/api}Block')
		fipstract=block.attrib['FIPS'][0:11]
	else:
		fipstract='99999999999'
	fipslist.append(fipstract)




#This block of code does aggregation
countarray={}
incomearray={}


for rownum in range(sh.nrows)[1:sh.nrows]:
	tidx=rownum-1
	income=sh.row_values(rownum)[incomefield]
	tract=str(fipslist[tidx])
	if countarray.has_key(tract):
		countarray[tract]=countarray[tract]+1
		incomearray[tract]=incomearray[tract]+income
	else:
		countarray[tract]=1
		incomearray[tract]=income

tractunique=set(fipslist)
with open(outputcsvfile, 'wb') as csvfile:
	outwriter=csv.writer(csvfile, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL)
	outwriter.writerow(['Tract', 'TotalIncome', 'Count'])
	for s in tractunique:
		outwriter.writerow([s,incomearray[s],countarray[s]])
