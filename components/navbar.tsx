import { Button } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { MapPinHouse } from 'lucide-react';
import { useState } from 'react';
import AboutModal from './about-modal';
import { FilterValues } from '@/types';

export default function Navbar({ onSearch, onSavedClick }: { onSearch: (filters: FilterValues) => void, onSavedClick: () => void }) {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleAboutClick = () => {
    setIsAboutModalOpen(true);
  };

  const handleAboutModalClose = () => {
    setIsAboutModalOpen(false);
  };

  return (
    <>
      <div className="w-full h-16 bg-primary shadow-sm mb-4 p-6 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3 w-full">
          <MapPinHouse size={24} />
          <h1 className="hidden sm:flex text-lg font-bold !mb-0">Atlanta Property Search</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button type="default" onClick={handleAboutClick}>
            About
          </Button>
          <Button type="default" icon={<BookOutlined />} onClick={onSavedClick}>
            Saved
          </Button>
        </div>
      </div>
      <AboutModal isOpen={isAboutModalOpen} onClose={handleAboutModalClose} />
    </>
  );
}