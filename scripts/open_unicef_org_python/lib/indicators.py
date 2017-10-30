import json
import os 
import re
import shutil
import urllib
import xml.etree.ElementTree as ET

class Indicators:
    def __init__(self, input_dir, output_dir):
        ##G:\opendata_indicator_work
        self.input_dir  = input_dir;
        self.output_dir = output_dir;

        #print '###';
        #print output_dir;        
        #print(os.path.exists(output_dir));
        #exit();
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
         
	
        
    ## below methods are added by vijay on
    ## 14/10/2016 for adding document links from xml files
    def pickXml(self, xmlPath):
        tree = ET.parse(xmlPath)
        root = tree.getroot()
        activities = root.findall('iati-activity')
        
        idsArr = []
        finalArr = dict()
        for activity in activities:
            #iati_identifier = iactivity.findall('iati-identifier')
            identifier = activity.find('iati-identifier')
            identifierTextArr = identifier.text.split("-")
            
            results = activity.findall('result')
            indicatorTmp = [];
            for result in results:
                
                headline = result.find('title/narrative').text;
                indicator_name = result.find('indicator/title/narrative').text;
                baseline_value = result.find('indicator/baseline').attrib['value'];
                baseline_year = result.find('indicator/baseline').attrib['year'];

                target_value = result.find('indicator/period/target').attrib['value'];
                status_value = result.find('indicator/period/actual/comment/narrative').text;

                tmp = { 
                    "indicator_name"    : indicator_name, 
                    "headline"          : headline, 
                    "baseline_year"     : baseline_year, 
                    "baseline_value"    : baseline_value,
                    "target_value"      : target_value,
                    "target_year"       : "target_year",
                    "status_value"      : status_value,
                    "status_date"       : "status_date"        
                } 
                
                indicatorTmp.append( tmp )
                
            
            if identifierTextArr[2] in finalArr:
                # append the new number to the existing array at this slot
                finalArr[identifierTextArr[2]].append(indicatorTmp)
            else:
                # create a new array in this slot
                finalArr[identifierTextArr[2]] = indicatorTmp   
                
        return finalArr;
           
           
        
    def generate_json(self, output_path, doc_links_arr, country_name):
        # chnages in front end (js\data\iatiData.js) and (themes\openunicef\footer.php)
        mypath = os.path.join(output_path, country_name)
        mypath = mypath + '.json'
         
        f = open(mypath, "w")
        json.dump(doc_links_arr, f)
        f.close()

    def traverse_all_xmls(self):
        jsonPath = self.output_dir
        xmlPath = self.input_dir
        
        for subdir, dirs, files in os.walk(xmlPath):
            for file in files:                            
                if file.endswith(".xml"):
                    if file.find("iatiActivity_") > -1:                    
                        country_nameArr = file.split("iatiActivity_")
                        country_name = country_nameArr[1]
                        country_name = urllib.unquote(country_name).decode('utf8') 
                        country_name = country_name.replace(" ", "-")
                        country_name = os.path.splitext(country_name)[0]
                        doc_links_arr = {}
                        doc_links_arr = self.pickXml(os.path.join(subdir, file))
                        self.generate_json(jsonPath, doc_links_arr, country_name)