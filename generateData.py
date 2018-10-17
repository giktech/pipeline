import numpy as np
import datetime as dt
import random as rndm
import json

frmt = '%d-%m-%Y %H:%M:%S'

def generateHourOfData(hourDt, avgMsgPerMin, stdMsg):
    msgPerMinute = np.random.normal(loc=avgMsgPerMin, scale=stdMsg, size=59)
    msgPerMinute = msgPerMinute.astype(int)

    msgTimes = []
    for i, numMsgs in enumerate(msgPerMinute):
        msgTimes += randomMinutes(hourDt + dt.timedelta(minutes=i), numMsgs)

    return msgTimes


def randomMinutes(startDt, n):
    endDt = startDt + dt.timedelta(seconds=60)
    timeDiff = endDt - startDt
    return [rndm.random() * timeDiff + startDt for _ in range(n)]


def formatAsJson(msgDatetimes):
    msgDict = [{"stageNum": 1, "timestamp": dt.datetime.strftime(msgDt, frmt)} for msgDt in msgDatetimes]
    return json.dumps({"data": msgDict}, indent=3)


messages = []
startDt = dt.datetime.strptime("01-01-2018 03:00:00", frmt)
for i in range(5):
    messages += generateHourOfData(startDt + dt.timedelta(hours=i), 16, 3)

msgJson = formatAsJson(messages)
with open('data.json', 'w') as outfile:
    outfile.write(msgJson)