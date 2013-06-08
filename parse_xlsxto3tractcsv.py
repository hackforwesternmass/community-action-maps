import csv
import urlgrabber
import xml.etree.ElementTree as ET
import xlrd
import sys
class DataMunger (object):
	def __init__(self, inp, out):
		self.wb=xlrd.open_workbook(inp)
		self.sh=self.wb.sheet_by_index(0)
		self.fipslist=[]
		self.inp = inp
		self.out = out
		# Assumes header with column headings
		nvars=self.sh.ncols

		#in cell form
		headers=self.sh.row(0)
		col=0
		varlist=[]
		for vars in headers:
			varlist.append(vars.value)
			
		#pull out fields:
		#This could  be made more flexible...
			if vars.value == 'Address':
				self.addressfield=col
			elif vars.value == 'City':
				self.cityfield=col
			elif vars.value == 'Zip':
				self.zipfield=col
			elif vars.value == 'income':
				self.incomefield=col
			col=col+1
	def getfips(self):
		#skip header row, go through rest of data

		#This block of code attaches FIPS to addresses 
		for rownum in range(self.sh.nrows)[1:self.sh.nrows]:
			address=self.sh.row_values(rownum)[self.addressfield]+","
		# Hard coding in Massachusetts!
		    	city=self.sh.row_values(rownum)[self.cityfield]+", Ma"
		    	zipcode=self.sh.row_values(rownum)[self.zipfield]
		    	buildurl='http://rpc.geocoder.us/service/csv?address='+address+'+'+city+'+'+zipcode
		# get rid of ridiculous unicode nonbreaking spaces and all spaces
			buildurl=buildurl.replace(u'\xa0', u'').replace(' ','+')
		# switch type to string
			burlstr=buildurl.encode('ascii','ignore')
			print burlstr
			outp=urlgrabber.urlread(burlstr)

		# If address not resolved, skip it, assign 999999 tract code:
			if outp != "2: couldn't find this address! sorry":
				lat = outp.split(",")[0]
				lon = outp.split(",")[1]
				buildcensurl = 'http://data.fcc.gov/api/block/2010/find?latitude='+lat+'&longitude='+lon
				outblock = urlgrabber.urlread(buildcensurl)
				e = ET.fromstring(outblock)
				block = e.find('{http://data.fcc.gov/api}Block')
				fipstract = block.attrib['FIPS'][0:11]
			else:
				fipstract='99999999999'
			self.fipslist.append(fipstract)
	def aggregate(self):
		countarray={}
		incomearray={}

		for rownum in range(self.sh.nrows)[1:self.sh.nrows]:
			tidx=rownum-1
			income=self.sh.row_values(rownum)[self.incomefield]
			tract=str(self.fipslist[tidx])
			if countarray.has_key(tract):
				countarray[tract] = countarray[tract] + 1
				incomearray[tract] = incomearray[tract] + income
			else:
				countarray[tract] = 1
				incomearray[tract] = income

		tractunique = set(self.fipslist)
		with open(self.out, 'wb') as csvfile:
			outwriter = csv.writer(csvfile, delimiter = ',', quotechar = '|', quoting = csv.QUOTE_MINIMAL)
			outwriter.writerow(['Tract', 'TotalIncome', 'Count'])
			for s in tractunique:
				outwriter.writerow([s,incomearray[s],countarray[s]])
	def dowork(self):
		fips = self.getfips()
		mkdata = self.aggregate()

#This block of code does aggregation



if __name__ == '__main__':
	if len(sys.argv) < 2:
		#test data
		inp = 'CADt2t.xlsx'
		out = 'tractdata.csv'
	else:
		inp = sys.argv[1]
		out = sys.argv[2]
	munger = DataMunger(inp, out)
	munger.dowork()