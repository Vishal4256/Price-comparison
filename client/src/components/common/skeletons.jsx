import React from 'react';
import Skeleton from '../ui/Skeleton';
import { Card, CardContent, CardFooter } from '../ui/Card';

export const ProductCardSkeleton = () => (
  <Card className="flex flex-col h-full border-gray-100 dark:border-gray-800">
    <div className="relative aspect-square p-4 bg-white dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
      <Skeleton className="w-3/4 h-3/4 rounded-lg" />
    </div>
    <CardContent className="p-4 flex-grow space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <div className="flex items-center space-x-2 pt-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </CardContent>
    <CardFooter className="p-4 pt-0 flex justify-between items-end border-t border-gray-100 dark:border-gray-800 mt-auto pt-4">
      <div className="space-y-1">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </CardFooter>
  </Card>
);

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center space-y-3 p-4">
    <Skeleton className="w-16 h-16 rounded-full" />
    <Skeleton className="h-4 w-20" />
  </div>
);

export const HeroSkeleton = () => (
  <div className="w-full rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm">
    <div className="flex flex-col md:flex-row h-[400px]">
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center space-y-4">
        <Skeleton className="h-8 w-24 rounded-full mb-2" />
        <Skeleton className="h-12 w-3/4 md:w-full" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-5/6 mt-4" />
        <div className="flex space-x-4 mt-8">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center p-12 bg-gray-50 dark:bg-gray-900/50">
        <Skeleton className="w-full max-w-sm aspect-square rounded-full" />
      </div>
    </div>
  </div>
);

export const ProductGallerySkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-full aspect-square rounded-2xl" />
    <div className="flex gap-4 overflow-x-auto">
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
    </div>
  </div>
);

export const PriceCardSkeleton = () => (
  <Card className="p-6">
    <Skeleton className="w-32 h-6 mb-4" />
    <Skeleton className="w-48 h-10 mb-2" />
    <Skeleton className="w-24 h-4 mb-6" />
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="w-24 h-8 rounded-full" />
      <Skeleton className="w-20 h-4" />
    </div>
    <Skeleton className="w-full h-12 rounded-xl" />
  </Card>
);

export const RetailerTableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="w-full h-12 rounded-lg" />
    <Skeleton className="w-full h-16 rounded-lg" />
    <Skeleton className="w-full h-16 rounded-lg" />
    <Skeleton className="w-full h-16 rounded-lg" />
  </div>
);

export const ChartSkeleton = () => (
  <Card className="p-6 h-[400px] flex flex-col">
    <Skeleton className="w-48 h-6 mb-8" />
    <div className="flex-1 flex items-end justify-between gap-2">
      <Skeleton className="w-full h-1/3 rounded-t-sm" />
      <Skeleton className="w-full h-1/2 rounded-t-sm" />
      <Skeleton className="w-full h-3/4 rounded-t-sm" />
      <Skeleton className="w-full h-2/3 rounded-t-sm" />
      <Skeleton className="w-full h-1/4 rounded-t-sm" />
      <Skeleton className="w-full h-1/2 rounded-t-sm" />
      <Skeleton className="w-full h-4/5 rounded-t-sm" />
    </div>
  </Card>
);

export const SpecificationSkeleton = () => (
  <div className="space-y-4">
    <div className="flex border-b border-gray-100 dark:border-gray-800 pb-4">
      <Skeleton className="w-1/3 h-5" />
      <Skeleton className="w-2/3 h-5 ml-4" />
    </div>
    <div className="flex border-b border-gray-100 dark:border-gray-800 pb-4">
      <Skeleton className="w-1/3 h-5" />
      <Skeleton className="w-2/3 h-5 ml-4" />
    </div>
    <div className="flex border-b border-gray-100 dark:border-gray-800 pb-4">
      <Skeleton className="w-1/3 h-5" />
      <Skeleton className="w-2/3 h-5 ml-4" />
    </div>
  </div>
);

export const CompareHeaderSkeleton = () => (
  <div className="flex items-center justify-between mb-8">
    <Skeleton className="w-48 h-8" />
    <Skeleton className="w-24 h-10 rounded-lg" />
  </div>
);

export const CompareCardSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-full aspect-square rounded-2xl" />
    <Skeleton className="w-3/4 h-6" />
    <Skeleton className="w-1/2 h-4" />
    <Skeleton className="w-1/3 h-6 mt-2" />
  </div>
);

export const CompareTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex gap-4">
      <Skeleton className="w-1/4 h-12 rounded-lg" />
      <Skeleton className="flex-1 h-12 rounded-lg" />
      <Skeleton className="flex-1 h-12 rounded-lg" />
      <Skeleton className="flex-1 h-12 rounded-lg" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="w-1/4 h-12 rounded-lg" />
      <Skeleton className="flex-1 h-12 rounded-lg" />
      <Skeleton className="flex-1 h-12 rounded-lg" />
      <Skeleton className="flex-1 h-12 rounded-lg" />
    </div>
  </div>
);

export const CompareChartSkeleton = () => (
  <Card className="p-6 h-[400px] flex flex-col">
    <Skeleton className="w-48 h-6 mb-8" />
    <Skeleton className="w-full h-full rounded-lg" />
  </Card>
);

export const DashboardHeaderSkeleton = () => (
  <div className="flex items-center justify-between mb-8 py-6">
    <div>
      <Skeleton className="w-48 h-10 mb-2" />
      <Skeleton className="w-64 h-5" />
    </div>
    <Skeleton className="w-16 h-16 rounded-full" />
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <Skeleton className="w-full h-28 rounded-2xl" />
    <Skeleton className="w-full h-28 rounded-2xl" />
    <Skeleton className="w-full h-28 rounded-2xl" />
    <Skeleton className="w-full h-28 rounded-2xl" />
  </div>
);

export const AlertSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="w-full h-24 rounded-2xl" />
    <Skeleton className="w-full h-24 rounded-2xl" />
  </div>
);
