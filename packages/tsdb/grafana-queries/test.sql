SELECT time_bucket(interval '$__interval', time)       AS "time",
       avg(resistance_ohms) FILTER (WHERE channel = 1) AS "Channel 1",
       avg(resistance_ohms) FILTER (WHERE channel = 2) AS "Channel 2",
       avg(resistance_ohms) FILTER (WHERE channel = 3) AS "Channel 3",
       avg(resistance_ohms) FILTER (WHERE channel = 4) AS "Channel 4"
FROM sensor_metrics
WHERE $__timeFilter(time) AND instance = 'sensor-1'
GROUP BY 1
ORDER BY 1 DESC;
