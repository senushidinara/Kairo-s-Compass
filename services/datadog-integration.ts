import { StatsD } from 'hot-shots';

// Datadog StatsD client configuration
const statsd = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: parseInt(process.env.DD_DOGSTATSD_PORT || '8125'),
  prefix: 'kairo.',
  globalTags: {
    service: process.env.DD_SERVICE || 'kairo-compass',
    env: process.env.DD_ENV || 'development',
    version: process.env.DD_VERSION || '1.0.0',
  },
  errorHandler: (error) => {
    console.error('StatsD Error:', error);
  },
});

/**
 * Datadog Integration Service
 * Provides utilities for custom metrics collection and reporting
 */
export class DatadogIntegration {
  private static instance: DatadogIntegration;
  private client: StatsD;

  private constructor() {
    this.client = statsd;
  }

  static getInstance(): DatadogIntegration {
    if (!DatadogIntegration.instance) {
      DatadogIntegration.instance = new DatadogIntegration();
    }
    return DatadogIntegration.instance;
  }

  /**
   * Route Calculation Metrics
   */
  recordRouteCalculation(duration: number, success: boolean, tags?: Record<string, string>) {
    const metricTags = { success: success.toString(), ...tags };
    
    this.client.histogram('route.calculation_time_ms', duration, metricTags);
    this.client.increment('route.calculations.total', 1, metricTags);
    
    if (success) {
      this.client.increment('route.calculations.success', 1, metricTags);
    } else {
      this.client.increment('route.calculations.failure', 1, metricTags);
    }
  }

  recordRouteOptimizationSuccess(success: boolean, tags?: Record<string, string>) {
    this.client.increment('route.optimization_success', success ? 1 : 0, tags);
  }

  /**
   * Fuel Savings Metrics
   */
  recordFuelSavings(
    percentageSaved: number,
    totalSaved: number,
    predicted: number,
    actual: number,
    tags?: Record<string, string>
  ) {
    this.client.gauge('fuel_savings.percentage', percentageSaved, tags);
    this.client.gauge('fuel_savings.total', totalSaved, tags);
    this.client.gauge('fuel_savings.predicted', predicted, tags);
    this.client.gauge('fuel_savings.actual', actual, tags);
    
    // Calculate prediction error
    const error = Math.abs(actual - predicted) / predicted;
    this.client.gauge('fuel_savings.prediction_error', error, tags);
  }

  /**
   * Voyage Metrics
   */
  recordVoyageOptimized(voyageId: string, tags?: Record<string, string>) {
    this.client.increment('voyages.optimized', 1, { voyage_id: voyageId, ...tags });
  }

  recordVoyageStatus(status: 'active' | 'completed' | 'cancelled', count: number, tags?: Record<string, string>) {
    this.client.gauge('voyages.count', count, { status, ...tags });
  }

  recordActiveVoyages(count: number, tags?: Record<string, string>) {
    this.client.gauge('voyages.active', count, tags);
  }

  /**
   * AIS Data Pipeline Metrics
   */
  recordAISDataIngestion(messagesPerSecond: number, dataAge: number, tags?: Record<string, string>) {
    this.client.gauge('ais.messages_per_second', messagesPerSecond, tags);
    this.client.gauge('ais.data_age_seconds', dataAge, tags);
  }

  recordAISIngestionError(error: Error, tags?: Record<string, string>) {
    this.client.increment('ais.ingestion_errors', 1, { error: error.name, ...tags });
  }

  /**
   * Model Performance Metrics
   */
  recordModelPerformance(
    modelName: string,
    accuracyScore: number,
    confidence: number,
    tags?: Record<string, string>
  ) {
    const modelTags = { model: modelName, ...tags };
    this.client.gauge('current.accuracy_score', accuracyScore, modelTags);
    this.client.histogram('model.confidence', confidence, modelTags);
  }

  recordPortCongestionPrediction(
    portId: string,
    accuracy: number,
    predicted: boolean,
    actual: boolean,
    tags?: Record<string, string>
  ) {
    const predictionTags = { port_id: portId, ...tags };
    this.client.gauge('port.congestion_prediction_accuracy', accuracy, predictionTags);
    
    if (predicted === actual) {
      this.client.increment('port.congestion_predictions.correct', 1, predictionTags);
    } else {
      this.client.increment('port.congestion_predictions.incorrect', 1, predictionTags);
      
      if (predicted && !actual) {
        this.client.increment('port.congestion_false_positives', 1, predictionTags);
      }
    }
  }

  /**
   * Business Metrics
   */
  recordCO2Reduction(amount: number, tags?: Record<string, string>) {
    this.client.gauge('co2_reduction.total', amount, tags);
  }

  recordCostSavings(amount: number, currency: string = 'USD', tags?: Record<string, string>) {
    this.client.gauge('cost_savings.total', amount, { currency, ...tags });
  }

  recordETAAccuracy(deviationMinutes: number, tags?: Record<string, string>) {
    this.client.histogram('eta.accuracy_minutes', deviationMinutes, tags);
  }

  /**
   * Database Metrics
   */
  recordDatabaseQuery(duration: number, queryType: string, success: boolean, tags?: Record<string, string>) {
    const queryTags = { query_type: queryType, success: success.toString(), ...tags };
    this.client.histogram('db.query.duration_ms', duration, queryTags);
  }

  recordDatabaseConnectionPool(used: number, total: number, tags?: Record<string, string>) {
    this.client.gauge('db.connection_pool.used', used, tags);
    this.client.gauge('db.connection_pool.total', total, tags);
    this.client.gauge('db.connections.active', used, tags);
    this.client.gauge('db.connections.idle', total - used, tags);
  }

  /**
   * Cache Metrics
   */
  recordCacheHit(tags?: Record<string, string>) {
    this.client.increment('cache.hits', 1, tags);
  }

  recordCacheMiss(tags?: Record<string, string>) {
    this.client.increment('cache.misses', 1, tags);
  }

  /**
   * Kafka Metrics
   */
  recordKafkaConsumerLag(topic: string, partition: number, lag: number, tags?: Record<string, string>) {
    this.client.gauge('kafka.consumer_lag', lag, { topic, partition: partition.toString(), ...tags });
  }

  /**
   * System Health Metrics
   */
  recordSystemHealthScore(score: number, tags?: Record<string, string>) {
    this.client.gauge('system.health_score', score, tags);
  }

  /**
   * API Metrics (if not using dd-trace APM)
   */
  recordAPIRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    tags?: Record<string, string>
  ) {
    const requestTags = { endpoint, method, status_code: statusCode.toString(), ...tags };
    
    this.client.increment('api.requests', 1, requestTags);
    this.client.histogram('api.request.duration_ms', duration, requestTags);
    
    if (statusCode >= 500) {
      this.client.increment('api.errors.5xx', 1, requestTags);
    } else if (statusCode >= 400) {
      this.client.increment('api.errors.4xx', 1, requestTags);
    }
  }

  /**
   * Custom Metric - Vessel Position
   */
  recordVesselPosition(vesselId: string, latitude: number, longitude: number, tags?: Record<string, string>) {
    const vesselTags = { vessel_id: vesselId, ...tags };
    this.client.gauge('vessel.latitude', latitude, vesselTags);
    this.client.gauge('vessel.longitude', longitude, vesselTags);
  }

  /**
   * Timing utility for measuring execution time
   */
  async measureTime<T>(
    metricName: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = Date.now();
    let success = true;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - start;
      this.client.histogram(metricName, duration, { success: success.toString(), ...tags });
    }
  }

  /**
   * Close the StatsD client
   */
  close(): void {
    this.client.close(() => {
      console.log('Datadog StatsD client closed');
    });
  }
}

// Export singleton instance
export const datadogIntegration = DatadogIntegration.getInstance();

// Export for convenience
export default datadogIntegration;
