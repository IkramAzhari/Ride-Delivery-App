import React from 'react';
import RideForm from '../components/RideForm';

export default function TestGpsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">اختبار ميزة الـ GPS</h1>
      <RideForm />
    </div>
  );
}