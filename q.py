import urlgrabber
import xml.etree.ElementTree as ET

file=open('a.csv','r')
for line in file:
    buildurl='http://rpc.geocoder.us/service/csv?address='+line
    buildurl=buildurl.replace(' ','+')
    out=urlgrabber.urlread(buildurl)
    lat=out.split(",")[0]
    lon=out.split(",")[1]
    buildcensurl='http://data.fcc.gov/api/block/2010/find?latitude='+lat+'&longitude='+lon
    outblock=urlgrabber.urlread(buildcensurl)
    e = ET.fromstring(outblock)
    block = e.find('{http://data.fcc.gov/api}Block')
    print block.attrib['FIPS']
