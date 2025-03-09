import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  animate?: boolean;
}

/**
 * A skeleton loader component that provides visual feedback during loading states
 */
const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  circle = false,
  animate = true
}) => {
  return (
    <div
      className={clsx(
        'bg-gray-200 inline-block',
        animate && 'animate-pulse',
        circle && 'rounded-full',
        !circle && 'rounded',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

interface CardSkeletonProps {
  rows?: number;
  hasImage?: boolean;
}

/**
 * A card-like skeleton loader for content
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  rows = 3,
  hasImage = false
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm w-full">
      <div className="flex items-start space-x-4">
        {hasImage && (
          <Skeleton width={64} height={64} circle />
        )}
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={20} />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} width={i % 2 === 0 ? '100%' : '80%'} height={14} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatCardSkeletonProps {
  count?: number;
}

/**
 * A skeleton loader for stat cards
 */
export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({
  count = 4
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Skeleton width={40} height={40} className="mr-4" />
            <div>
              <Skeleton width={100} height={16} className="mb-2" />
              <Skeleton width={60} height={24} />
            </div>
          </div>
          <Skeleton width="40%" height={16} />
        </div>
      ))}
    </div>
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

/**
 * A skeleton loader for tables
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <Skeleton width="20%" height={20} />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                width={colIndex === 0 ? '30%' : `${Math.floor(60 / (columns - 1))}%`}
                height={16}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * A skeleton loader for notifications
 */
export const NotificationSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-4 flex justify-between">
        <Skeleton width={100} height={18} />
        <Skeleton width={80} height={18} />
      </div>
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex items-start">
              <Skeleton width={8} height={8} className="mt-2 mr-2" circle />
              <div className="flex-1">
                <Skeleton width="80%" height={16} className="mb-2" />
                <Skeleton width="40%" height={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton; 