#!/usr/bin/env python

"""
Maarten Groen
"""
import requests
from pymongo import MongoClient
import polyline


import math

def calcDistance(origin, destination, morkm):
    lat1 = float(origin['latitude'])
    lon1 = float(origin['longitude'])
    lat2 = float(destination['latitude'])
    lon2 = float(destination['longitude'])
    radius = 6371*morkm # m

    dlat = math.radians(lat2-lat1)
    dlon = math.radians(lon2-lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    d = radius * c

    return d

def generalStatistics():
    collection = db.routes
    print('Totale aantal routes: '+ str(collection.find().count()))

    i=0
    totalDataPoints=0
    totalTime = 0
    for route in collection.find():
        routeTime = route['endDatetime'] - route['startDatetime']
        totalTime += routeTime
        totalDataPoints += len(route['route'])
        if float(route['distance_inkm']) > 1.00:
            i +=1

    print('Hoeveelheid routes langer dan 1km: '+ str(i))
    print('Totale tijd gefietst en gelopen: '+ str(((totalTime/1000)/60)/60) +' uur')
    print('Totale hoeveelheid datapunten: '+str(totalDataPoints))


def removeHighAccuracy():
    collection = db.routes
    allRoutes = list(collection.find())
    print(len(allRoutes))
    for route in allRoutes:
        route['route'][:] = [datapoint for datapoint in route['route'] if float(datapoint['coordinates']['accuracy']) < 50]

    allRoutes[:] =[route for route in allRoutes if len(route['route']) > 5]
    print(len(allRoutes))

    for route in allRoutes:
        for datapoint in route['route']:

            if float(datapoint['coordinates']['accuracy']) > 50:
                print(datapoint['coordinates']['accuracy'])


    collection = db.cleanRoutes
    collection.insert(allRoutes)

def splitHighDistance(maxDistance):
    collection = db.cleanRoutes
    allRoutes = list(collection.find())
    print(len(allRoutes))
    routeParts = []

    for route in allRoutes:
        i=1
        print('#####################NEW ROUTE!!!!!###############################')
        print(route['_id'])
        print(route['teamid'])
        print(route['distance_inkm'])
        print(len(route['route']))
        currentKey = 0
        previousKey = 0
        for datapoint in route['route'][:-1]:

            pointsDistance = calcDistance(datapoint['coordinates'], route['route'][i]['coordinates'], 1000)

            if pointsDistance > maxDistance or i == len(route['route'])-1:
                print(pointsDistance)
                print(previousKey)
                print(currentKey)
                partRoute = route['route'][previousKey:currentKey+1]
                if len(partRoute) > 4:
                    newRouteObject = {}
                    newRouteObject['teamid'] = route['teamid']
                    newRouteObject['transport_method'] = route['transport_method']
                    newRouteObject['newroute'] = partRoute
                    routeParts.append(newRouteObject)

                previousKey = currentKey+1

            i += 1
            currentKey +=1


    newToAddRoutes = []
    for route in routeParts:
        newObject = {}
        newObject['teamid'] = route['teamid']
        newObject['transport_method'] = route['transport_method']
        newObject['route'] = route['newroute']
        newToAddRoutes.append(newObject)

    print(len(newToAddRoutes))
    print(len(allRoutes))

    collection = db.cleanerRoutes
    collection.insert(newToAddRoutes)

def recalculateRouteStats():
    collection = db.cleanerRoutes
    allRoutes = list(collection.find())
    i=0
    for route in allRoutes:

        coorList = []
        totalkm = 0.00
        j = 1
        for datapoint in route['route']:
            coorList.append([float(datapoint['coordinates']['latitude']),float(datapoint['coordinates']['longitude'])])
            if j == len(route['route'])-1:
                break
            totalkm += calcDistance(datapoint['coordinates'],route['route'][j]['coordinates'],1)
            j += 1

        lineString = polyline.encode(coorList)
        route['lineString'] = lineString
        startDate = int(float(route['route'][0]['timestamp']))
        endDate = int(float(route['route'][len(route['route'])-1]['timestamp']));
        route['startDatetime'] = startDate
        route['endDatetime'] = endDate
        route['distance_inkm'] = "%.2f" % totalkm
        #print route['distance_inkm']
        i +=1
    collection = db.cleanestRoutes
    collection.insert(allRoutes)




if __name__ == '__main__':

    #Connect to MongoDB
    client = MongoClient()
    db = client.sim_locaties

    generalStatistics()
    removeHighAccuracy()
    maxDistance = 100 #in meters
    splitHighDistance(maxDistance)
    recalculateRouteStats()




