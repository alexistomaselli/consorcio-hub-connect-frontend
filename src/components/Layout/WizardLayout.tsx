import React from 'react';
import { ProfileWizardNav } from '../Sidebar/ProfileWizardNav';
import Header from './Header';

interface Props {
  children: React.ReactNode;
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function WizardLayout({ children, currentStep, onStepClick }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50/50">
        <ProfileWizardNav currentStep={currentStep} onStepClick={onStepClick} />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      </div>
    </div>
  );
}
