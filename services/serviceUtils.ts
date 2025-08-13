/**
 * Service Layer Utilities
 * 
 * Standardized patterns for all service functions:
 * - Consistent error handling
 * - Uniform logging
 * - Type-safe operations
 * - Performance monitoring
 */

// Service error types
export interface ServiceError {
  code: string;
  message: string;
  context?: Record<string, any>;
  originalError?: Error;
}

export class AdaptiveServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, any>,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AdaptiveServiceError';
  }
}

// Logging utilities
export const ServiceLogger = {
  info: (service: string, operation: string, message: string, context?: Record<string, any>) => {
    console.log(`[${service}] ${operation}: ${message}`, context ? { ...context } : '');
  },
  
  warn: (service: string, operation: string, message: string, context?: Record<string, any>) => {
    console.warn(`[${service}] ${operation}: ${message}`, context ? { ...context } : '');
  },
  
  error: (service: string, operation: string, error: Error | AdaptiveServiceError, context?: Record<string, any>) => {
    if (error instanceof AdaptiveServiceError) {
      console.error(`[${service}] ${operation} - ${error.code}: ${error.message}`, {
        ...error.context,
        ...context,
        originalError: error.originalError
      });
    } else {
      console.error(`[${service}] ${operation}: ${error.message}`, {
        ...context,
        stack: error.stack
      });
    }
  },
  
  debug: (service: string, operation: string, message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${service}] ${operation}: ${message}`, context ? { ...context } : '');
    }
  }
};

// Performance monitoring
export const withPerformanceLogging = async <T>(
  service: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  ServiceLogger.debug(service, operation, 'Operation started');
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    ServiceLogger.debug(service, operation, `Operation completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    ServiceLogger.error(service, operation, error as Error, { duration: `${duration}ms` });
    throw error;
  }
};

// Database error handling
export const handleDatabaseError = (
  service: string,
  operation: string,
  error: any,
  context?: Record<string, any>
): never => {
  const serviceError = new AdaptiveServiceError(
    'DATABASE_ERROR',
    `Database operation failed in ${service}.${operation}`,
    { ...context, supabaseError: error },
    error
  );
  
  ServiceLogger.error(service, operation, serviceError);
  throw serviceError;
};

// Type-safe JSON converters (from phases 1-2)
export const toJsonSafe = <T>(data: T): any => {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    throw new AdaptiveServiceError(
      'JSON_CONVERSION_ERROR',
      'Failed to convert data to JSON-safe format',
      { data },
      error as Error
    );
  }
};

export const fromJsonSafe = <T>(data: any): T => {
  try {
    return data as T;
  } catch (error) {
    throw new AdaptiveServiceError(
      'JSON_PARSE_ERROR',
      'Failed to parse JSON data to expected type',
      { data },
      error as Error
    );
  }
};

// Standard database operation wrapper
export const executeDbOperation = async <T>(
  service: string,
  operation: string,
  dbOperation: () => Promise<{ data: T | null; error: any }>,
  context?: Record<string, any>
): Promise<T> => {
  return withPerformanceLogging(service, operation, async () => {
    ServiceLogger.debug(service, operation, 'Executing database operation', context);
    
    const { data, error } = await dbOperation();
    
    if (error) {
      handleDatabaseError(service, operation, error, context);
    }
    
    if (data === null) {
      throw new AdaptiveServiceError(
        'NO_DATA_RETURNED',
        `No data returned from ${service}.${operation}`,
        context
      );
    }
    
    return data;
  });
};

// Validation helpers
export const validateRequired = (
  service: string,
  operation: string,
  params: Record<string, any>
): void => {
  const missingParams = Object.entries(params)
    .filter(([_, value]) => value === undefined || value === null || value === '')
    .map(([key]) => key);
    
  if (missingParams.length > 0) {
    throw new AdaptiveServiceError(
      'VALIDATION_ERROR',
      `Missing required parameters in ${service}.${operation}`,
      { missingParams, providedParams: Object.keys(params) }
    );
  }
};

// Service response types
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
}

export interface ServiceListResponse<T> extends ServiceResponse<T[]> {
  count: number;
}

// Factory for creating standardized service responses
export const createServiceResponse = <T>(data: T): ServiceResponse<T> => ({
  data,
  success: true,
  timestamp: new Date().toISOString()
});

export const createServiceListResponse = <T>(data: T[]): ServiceListResponse<T> => ({
  data,
  count: data.length,
  success: true,
  timestamp: new Date().toISOString()
});
