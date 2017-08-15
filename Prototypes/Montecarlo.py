import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

df = pd.read_csv('../Data/Cache/export.csv', sep=";")

values = np.empty(df.shape[0])

spreadSum = 0
spreadSamples = 0

for index, row in df.iterrows(): #60 min
    if index + 60 < df.shape[0]:
        values[index] = (df.iloc[index + 60]['fundamental_oanda_eurusd_ask'] - row['fundamental_oanda_eurusd_ask'])

    if np.isnan(row['fundamental_oanda_eurusd_ask']) == False and np.isnan(row['fundamental_oanda_eurusd_bid']) == False:
        spreadSum += row['fundamental_oanda_eurusd_ask'] - row['fundamental_oanda_eurusd_bid']
        spreadSamples += 1

values = values[~np.isnan(values)]
values = np.sort(values);

print "AvgSpread: " + str(spreadSum / spreadSamples)
print "First: " + str(values[0])
print "Median: " + str(values[values.shape[0] / 2])
print "Last: " + str(values[values.shape[0] - 1])
print "Size: " + str(values.shape[0])

print "90%: " + str(values[int(values.shape[0] * 0.9)])
print "10%: " + str(values[int(values.shape[0] * 0.1)])

plt.plot(values)
plt.show()
