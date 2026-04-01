# KQL Queries for Application Insights

Ready-to-use Kusto Query Language (KQL) queries for analyzing telemetry from Business Central extensions in Application Insights.

## Error Analysis

### Most Common Errors (Last 24h)

```kql
traces
| where timestamp > ago(24h)
| where customDimensions.eventId startswith "BCS-" and customDimensions.eventId contains "E"
| summarize ErrorCount = count() by
    EventId = tostring(customDimensions.eventId),
    ErrorMessage = tostring(customDimensions.ErrorMessage)
| order by ErrorCount desc
| take 20
```

### Error Rate Percentage

```kql
let totalOps = toscalar(
    traces
    | where timestamp > ago(24h)
    | where message endswith "started"
    | where customDimensions.eventId startswith "BCS-"
    | count
);
let failedOps = toscalar(
    traces
    | where timestamp > ago(24h)
    | where customDimensions.eventId startswith "BCS-" and customDimensions.eventId contains "E"
    | count
);
print ErrorRate = iff(totalOps == 0, 0.0, (todouble(failedOps) / todouble(totalOps)) * 100)
```

### Errors with Call Stack

```kql
traces
| where timestamp > ago(7d)
| where customDimensions.eventId startswith "BCS-" and customDimensions.eventId contains "E"
| project
    timestamp,
    EventId = tostring(customDimensions.eventId),
    Message = message,
    ErrorMessage = tostring(customDimensions.ErrorMessage),
    CallStack = tostring(customDimensions.ErrorCallStack),
    Company = tostring(customDimensions.CompanyName)
| order by timestamp desc
| take 50
```

## Performance Analysis

### Average Duration by Operation

```kql
traces
| where timestamp > ago(7d)
| where customDimensions.eventId startswith "BCS-"
| where isnotempty(customDimensions.DurationMs)
| extend DurationMs = toint(customDimensions.DurationMs)
| summarize
    AvgDuration = avg(DurationMs),
    P50 = percentile(DurationMs, 50),
    P95 = percentile(DurationMs, 95),
    P99 = percentile(DurationMs, 99),
    Count = count()
  by EventId = tostring(customDimensions.eventId)
| order by AvgDuration desc
```

### Slow Operations (Performance Warnings)

```kql
traces
| where timestamp > ago(24h)
| where customDimensions.eventId startswith "BCS-" and customDimensions.eventId contains "P"
| project
    timestamp,
    Operation = tostring(customDimensions.Operation),
    DurationMs = toint(customDimensions.DurationMs),
    ThresholdMs = toint(customDimensions.ThresholdMs),
    Company = tostring(customDimensions.CompanyName)
| order by DurationMs desc
| take 50
```

### Performance Trend Over Time

```kql
traces
| where timestamp > ago(7d)
| where customDimensions.eventId startswith "BCS-"
| where isnotempty(customDimensions.DurationMs)
| extend DurationMs = toint(customDimensions.DurationMs)
| summarize
    AvgDuration = avg(DurationMs),
    P95 = percentile(DurationMs, 95)
  by bin(timestamp, 1h), EventId = tostring(customDimensions.eventId)
| render timechart
```

## Feature Usage Analytics

### Feature Usage Counts

```kql
traces
| where timestamp > ago(30d)
| where customDimensions.eventId startswith "BCS-FEAT"
| summarize UsageCount = count() by
    FeatureArea = tostring(customDimensions.FeatureArea),
    FeatureAction = tostring(customDimensions.FeatureAction)
| order by UsageCount desc
```

### Feature Usage Trend

```kql
traces
| where timestamp > ago(30d)
| where customDimensions.eventId startswith "BCS-FEAT"
| summarize UsageCount = count()
  by bin(timestamp, 1d), FeatureArea = tostring(customDimensions.FeatureArea)
| render timechart
```

### Feature Usage by Company

```kql
traces
| where timestamp > ago(30d)
| where customDimensions.eventId startswith "BCS-FEAT"
| summarize UsageCount = count() by
    Company = tostring(customDimensions.CompanyName),
    FeatureArea = tostring(customDimensions.FeatureArea)
| order by UsageCount desc
```

## Operational Dashboards

### Extension Health Summary

```kql
traces
| where timestamp > ago(24h)
| where customDimensions.eventId startswith "BCS-"
| extend Severity = case(
    customDimensions.eventId contains "E", "Error",
    customDimensions.eventId contains "W", "Warning",
    customDimensions.eventId contains "P", "Performance",
    "Info")
| summarize Count = count() by Severity
| render piechart
```

### Hourly Event Volume

```kql
traces
| where timestamp > ago(24h)
| where customDimensions.eventId startswith "BCS-"
| summarize EventCount = count() by bin(timestamp, 1h)
| render barchart
```

### Top Events by Volume

```kql
traces
| where timestamp > ago(7d)
| where customDimensions.eventId startswith "BCS-"
| summarize Count = count() by
    EventId = tostring(customDimensions.eventId),
    Message = message
| order by Count desc
| take 20
```

### Environment Breakdown

```kql
traces
| where timestamp > ago(7d)
| where customDimensions.eventId startswith "BCS-"
| summarize Count = count() by
    EnvironmentType = tostring(customDimensions.EnvironmentType),
    EnvironmentName = tostring(customDimensions.EnvironmentName),
    ExtensionVersion = tostring(customDimensions.ExtensionVersion)
| order by Count desc
```

## Alerting Queries

### High Error Rate Alert (>5%)

```kql
let lookback = 1h;
let started = toscalar(
    traces
    | where timestamp > ago(lookback)
    | where message endswith "started"
    | where customDimensions.eventId startswith "BCS-"
    | count
);
let errors = toscalar(
    traces
    | where timestamp > ago(lookback)
    | where customDimensions.eventId startswith "BCS-" and customDimensions.eventId contains "E"
    | count
);
let errorRate = iff(started == 0, 0.0, (todouble(errors) / todouble(started)) * 100);
print ErrorRate = errorRate, AlertTriggered = errorRate > 5.0
```

### P95 Latency Spike Alert

```kql
traces
| where timestamp > ago(1h)
| where customDimensions.eventId startswith "BCS-"
| where isnotempty(customDimensions.DurationMs)
| extend DurationMs = toint(customDimensions.DurationMs)
| summarize P95 = percentile(DurationMs, 95) by EventId = tostring(customDimensions.eventId)
| where P95 > 5000
| project EventId, P95_ms = P95, Alert = "P95 latency exceeds 5 seconds"
```

## Usage Notes

- Replace `BCS-` prefix with your actual extension prefix
- Adjust `ago()` timeframes to match your monitoring needs
- Use `render timechart` or `render barchart` for visualization in Application Insights
- Create Azure Monitor workbooks for persistent dashboards
- Set up alerts on critical queries (error rate, P95 latency)
