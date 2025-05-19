import React from 'react';
import FinancialForm from '../components/FinancialForm';
import ProofStatus from '../components/ProofStatus';

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <FinancialForm />
      <ProofStatus />
    </div>
  );
} 