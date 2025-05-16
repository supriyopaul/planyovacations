import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { QuickActions } from './components/layout/QuickActions';
import { Calendar } from './components/calendar/Calendar';
import { Modal } from './components/common/Modal';
import { useAppStore } from './store/appStore';

function App() {
  const { activeModal, setActiveModal } = useAppStore();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 pl-sidebar-collapsed transition-all duration-300">
        <div className="h-full">
          <Calendar />
        </div>
      </main>
      <QuickActions />

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'add-leave'}
        onClose={() => setActiveModal(null)}
        title="Add Planned Leave"
      >
        {/* TODO: Add leave form */}
      </Modal>

      <Modal
        isOpen={activeModal === 'add-busy'}
        onClose={() => setActiveModal(null)}
        title="Mark Busy Period"
      >
        {/* TODO: Add busy period form */}
      </Modal>

      <Modal
        isOpen={activeModal === 'add-slow'}
        onClose={() => setActiveModal(null)}
        title="Mark Slow Period"
      >
        {/* TODO: Add slow period form */}
      </Modal>

      <Modal
        isOpen={activeModal === 'suggestions'}
        onClose={() => setActiveModal(null)}
        title="Leave Suggestions"
      >
        {/* TODO: Add suggestions panel */}
      </Modal>

      <Modal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
        title="Settings"
      >
        {/* TODO: Add settings form */}
      </Modal>

      <Modal
        isOpen={activeModal === 'export'}
        onClose={() => setActiveModal(null)}
        title="Export Calendar"
      >
        {/* TODO: Add export options */}
      </Modal>

      <Modal
        isOpen={activeModal === 'import'}
        onClose={() => setActiveModal(null)}
        title="Import Calendar"
      >
        {/* TODO: Add import form */}
      </Modal>
    </div>
  );
}

export default App;
