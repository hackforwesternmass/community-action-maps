import urlgrabber
import xml.etree.ElementTree as ET
import xlrd

wb=xlrd.open_workbook('CADt2.xlsx')
sh=wb.sheet_by_index(0)

# Assumes header with column headings
nvars=sh.ncols

#in cell form
headers=sh.row(0)

col=0
varlist=[]
for vars in headers:
  varlist.append(vars.value)
	
#pull out address, city, zip fields:
	if vars.value == 'Address':
		addressfield=col
	elif vars.value == 'City':
		cityfield=col
	elif vars.value == 'Zip':
		zipfield=col
	col=col+1

fipslist=['fips']
#skip header row, go through rest of data
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

# If address not resolved, skip it, assign fake tract code:
	if out != "2: couldn't find this address! sorry":
		lat=out.split(",")[0]
		lon=out.split(",")[1]
		buildcensurl='http://data.fcc.gov/api/block/2010/find?latitude='+lat+'&longitude='+lon
		outblock=urlgrabber.urlread(buildcensurl)
		e = ET.fromstring(outblock)
		block = e.find('{http://data.fcc.gov/api}Block')
		fipstract=block.attrib['FIPS'][5:11]
	else:
		fipstract=999999
	
	fipslist.append(fipstract)
