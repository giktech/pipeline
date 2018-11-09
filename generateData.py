import numpy as np
import datetime as dt
import random as rndm
import json
import uuid
import os
import csv
import itertools

frmt = '%m-%d-%Y %H:%M:%S'
idCounter = 0
productStyles = ['style1', 'style2', 'style3', 'style4']
ages = ['under-30', '31-to-60', 'over-60']
genders = ['male', 'female']
regions = ['us', 'asia', 'europe']
nodes = [1, 2]
allEventCombos = list(itertools.product(*[productStyles, ages, genders, regions, nodes]))
targetDemoEventCombos = list(itertools.product(*[productStyles, ['under-30'], genders, ['us'], nodes]))
usEventCombos = list(itertools.product(*[productStyles, ages, genders, ['us'], nodes]))
europeEventCombos = list(itertools.product(*[productStyles, ages, genders, ['europe'], nodes]))
asiaEventCombos = list(itertools.product(*[productStyles, ages, genders, ['europe'], nodes]))
trendEventCombos = list(itertools.product(*[['style2'], ages, genders, ['asia'], nodes]))

# Event class that contains the fields for our event messages. Essentially just
# a simple constructor and an iterator
class Event:

    def __init__(self, id, productStyle, age, gender, region, node, stageNum, stageName, timestamp):
        self.id = id
        self.productStyle = productStyle
        self.age = age
        self.gender = gender
        self.region = region
        self.node = node
        self.stageNum = stageNum
        self.stageName = stageName
        self.timestamp = timestamp

    def __iter__(self):
        return iter([self.id, self.productStyle, self.age, self.gender, self.region, self.node, self.stageNum, self.stageName, self.timestamp])


# Generates event activity for the specified hour.
# Parameters:
#   hourDt (datetime) - The target hour being generated
#   
#   avgMsgsPerMin (int) - The average number of messages per minute
#   stdMsgPerMin (int) - The standard deviation of the messages per minute
#
# Returns:
#   events (list) - List of events that were generated
def generateHourOfData(hourDt, productStyle, age, gender, region, node, avgMsgPerMin, stdMsgPerMin):
    # Generate an array with given average and std with size 59. This represents 
    # the number of messages per minute. 
    msgPerMinute = np.random.normal(loc=avgMsgPerMin, scale=stdMsgPerMin, size=59)

    # Iterate through all 59 minutes and generate the actual datetimes
    events = []
    for i, numMsgs in enumerate(msgPerMinute):
        if (numMsgs < 0):
            continue

        # Calculate the target minute within the hour
        startDt = hourDt + dt.timedelta(minutes=i)

        # The number of messages per minute has a decimal part.
        # Use decimal value as the probability of a message being generated.
        if (numMsgs < 1):
            # This will trigger the next block of code to generate 1 
            # additional message
            if (np.random.uniform(0, 1) < numMsgs % 1):
                numMsgs += 1
        
        # Iterate for the number of messages that need to be created
        for _ in range(int(numMsgs)):
            # Increment the global ID counter
            global idCounter 
            idCounter += 1

            # Get some random second within the minute. Currently we don't care about
            # granularity at a seconds level, so this can be compeltely random.
            timestamp = rndm.random() * dt.timedelta(seconds=60) + startDt

            newEvent = Event(idCounter, productStyle, age, gender, region, node, 1, "Order Received", dt.datetime.strftime(timestamp, frmt))
            events.append(newEvent)

    return events


def generateBaselineMonth(monthDt, monthIdx):
    baseDt = monthDt.replace(day=1, hour=0)
    events = []

    base = (monthIdx * 30 * 0.00005) + 0.001
    dailyIncrement = 0
    for day in range(daysInMonth(baseDt)):
        dailyIncrement += 0.00005
        for combo in allEventCombos:
            for hour in range(24):
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], base + dailyIncrement, 0)

    return events


def generateTargetDemographicMonth(monthDt):
    baseDt = monthDt.replace(day=1, hour=0)
    events = []

    for day in range(daysInMonth(baseDt)):
        for combo in targetDemoEventCombos:
            for hour in range(24):
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.003, 0)

    return events


def generateEuropeMonth(monthDt):
    baseDt = monthDt.replace(day=1, hour=0)
    events = []

    for day in range(daysInMonth(baseDt)):
        for combo in europeEventCombos:
            for hour in range(24):
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.0003, 0)

    return events


def generateWorkdayMonth(monthDt):
    baseDt = monthDt.replace(day=1, hour=0)
    events = []

    # If date is a weekday, simulate a surge in activity during workdays hours
    for day in range(daysInMonth(baseDt)):
        if ((baseDt + dt.timedelta(days=day)).weekday() < 5):
            for combo in usEventCombos:
            
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=8), combo[0], combo[1], combo[2], combo[3], combo[4], 0.003, 0)
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=9), combo[0], combo[1], combo[2], combo[3], combo[4], 0.004, 0)

                for hour in range(10,15):
                    events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.007, 0)

                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=15), combo[0], combo[1], combo[2], combo[3], combo[4], 0.004, 0)
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=16), combo[0], combo[1], combo[2], combo[3], combo[4], 0.003, 0)

    return events


def generateHolidayMonth(monthDt):
    baseDt = monthDt.replace(day=1, hour=0)
    events = []

    for day in range(daysInMonth(baseDt)):
        for combo in allEventCombos:
            for hour in range(24):
                # New Years Day
                if (baseDt.month == 1 and day < 3):
                    events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.0015, 0)

                # Christmas and New Years Eve
                if (baseDt.month == 12 and day > 23):
                    events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.0015, 0)

                # Thanksgiving
                if (baseDt.month == 11 and day > 21 and day < 26):
                    events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.0015, 0)

    return events


def generateStyleTrendMonth(monthDt):
    baseDt = monthDt.replace(day=1, hour=0)
    events = []

    for combo in trendEventCombos:
        for hour in range(24):
            for day in range(10,20):
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.03, 0)

            events += generateHourOfData(baseDt + dt.timedelta(days=20, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.015, 0)
            events += generateHourOfData(baseDt + dt.timedelta(days=21, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.01, 0)
            events += generateHourOfData(baseDt + dt.timedelta(days=22, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], 0.005, 0)  

    return events


def generateAdCampaignMonth(monthDt):
    baseDt = monthDt.replace(day=1, hour=0)
    events = []

    dailyIncrement = 0
    for day in range(daysInMonth(baseDt)):
        dailyIncrement += 0.000033
        for hour in range(24):
            for combo in europeEventCombos:
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], dailyIncrement * 1.2, 0)

            for combo in asiaEventCombos:
                events += generateHourOfData(baseDt + dt.timedelta(days=day, hours=hour), combo[0], combo[1], combo[2], combo[3], combo[4], dailyIncrement, 0) 

    return events


def daysInMonth(targetDt):
    nextMonth = targetDt.replace(day=28) + dt.timedelta(days=4)    
    return (nextMonth - dt.timedelta(days=nextMonth.day)).day


def generateStage(events, prevStageNum, newStageName, avgGapInMins, stdGapInMins):
    minGaps = np.random.normal(loc=avgGapInMins, scale=stdGapInMins, size=len(events))
    # minGaps = minGaps.astype(int)

    for i, event in enumerate(events):
        if (len(event.stages) >= prevStageNum):
            prevTimestamp = dt.datetime.strptime(event.stages[prevStageNum-1].timestamp, frmt)
            newTimestamp = prevTimestamp + dt.timedelta(minutes=minGaps[i])
            newStage = Stage(prevStageNum + 1, newStageName, dt.datetime.strftime(newTimestamp, frmt))
            events[i].stages.append(newStage)

    return events


def generateCsvFile(events, filename):
    if (os.path.exists(filename)):
        os.remove(filename)

    first = True
    with open(filename, 'w', newline='') as outfile:
        wr = csv.writer(outfile, quoting=csv.QUOTE_NONNUMERIC)

        for event in events:
            if (first):
                first = False
                wr.writerow(["id", "productStyle", "age", "gender", "region", "node", "stageNum", "stageName", "timestamp"])

            wr.writerow(list(event))

        
# print(np.random.normal(loc=0.0001, scale=1, size=59))


startDt = dt.datetime.strptime("11-01-2017 00:00:00", frmt)
for i in range(3):
    monthEvents = []
    targetDt = startDt + dt.timedelta(days=i*32)

    # Generate the baseline events, essentially the white noise
    # to our data. This will simulate gradual growth in event
    # volume over time.
    monthEvents += generateBaselineMonth(targetDt, i)

    # Generate events during the workday hours. So Monday-Friday, from
    # 8-4. Curve the events as the workday progresses, getting most active
    # around noon. Limit these events to US regions to enforce a similar timezone
    monthEvents += generateWorkdayMonth(targetDt)

    # Generate US events. In general, a US-based company, so should expect more US
    # activity
    monthEvents += generateTargetDemographicMonth(targetDt)

    # Slightly more Euro events just to help differentiate the regions
    monthEvents += generateEuropeMonth(targetDt)

    # Generate events during the major holidays. 
    if (targetDt.month in [1, 11, 12]):
        monthEvents += generateHolidayMonth(targetDt)

    if (targetDt.month == 1):
        # Generate a huge spike in events for product style2 from region asia. This is
        # programmed to occur from days 10 to 22 in the target month. 
        monthEvents += generateStyleTrendMonth(targetDt)

        # Generate events for a simulated foreign ad campaign. The ad campaign increases events from
        # europe and asia, but it is more successful in europe
        monthEvents += generateAdCampaignMonth(targetDt)

    # Generate a period of downtime. Currently this will be harcoded on Feb 19. A
    # day within the trend spike. The insight will be that after the downtime, the trend
    # died down
    downtimeDate = dt.datetime.strptime('01-19-2018', '%m-%d-%Y')
    monthEvents = [event for event in monthEvents if dt.datetime.strptime(event.timestamp, frmt).date() != downtimeDate.date()]
    for combo in usEventCombos:
        for hour in range(24):
            monthEvents += generateHourOfData(downtimeDate, combo[0], combo[1], combo[2], combo[3], combo[4], 0.00002, 0)

    # monthEvents = generateStage(monthEvents, 1, "StageTwo", 30, 10)
    # monthEvents = generateStage(monthEvents, 2, "StageThree", 5, 75)
    # monthEvents = generateStage(monthEvents, 3, "StageFour", 150, 5)
    # monthEvents = generateStage(monthEvents, 4, "StageFive", 2500, 10)

    filename = 'data/csv/events-' + targetDt.strftime('%Y.%m') + '.csv'
    generateCsvFile(monthEvents, filename)
