import { useNavigate } from 'react-router';
import { useSystem } from './SystemContext';

export function SystemToggle() {
  const { currentSystem, toggleSystem } = useSystem();
  const navigate = useNavigate();

  const handleToggle = () => {
    toggleSystem();
    // Navigate to the new system
    const newSystem = currentSystem === 'AURUM' ? 'argentum' : 'aurum';
    navigate(`/${newSystem}`);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        relative px-6 py-2 rounded-lg font-bold transition-all duration-300
        ${currentSystem === 'AURUM' 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600' 
          : 'bg-gradient-to-r from-slate-500 to-blue-500 text-white hover:from-slate-600 hover:to-blue-600'
        }
      `}
      title={`Switch to ${currentSystem === 'AURUM' ? 'ARGENTUM' : 'AURUM'}`}
    >
      <div className="flex items-center space-x-2">
        
        <span>{currentSystem === 'AURUM' ? 'ARGENTUM' : 'AURUM'}</span>
      </div>
    </button>
  );
}

