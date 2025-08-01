import { Button } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { MapPinHouse } from 'lucide-react';
import { useState } from 'react';
import TargetSearch from './target-search';
import AboutModal from './about-modal';
import { FilterValues } from '@/types';

export default function Navbar({ onSearch }: { onSearch: (filters: FilterValues) => void }) {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleAboutClick = () => {
    setIsAboutModalOpen(true);
  };

  const handleAboutModalClose = () => {
    setIsAboutModalOpen(false);
  };

  return (
    <>
      <div className="w-full h-16 bg-primary shadow-sm mb-8 p-6 px-12 mx-2 flex justify-between items-center">
        <div className="flex items-center gap-6 w-full">
          <MapPinHouse size={24} />
          <TargetSearch onSearch={onSearch} />
        </div>
        <div className="flex items-center gap-3">
          <Button type="default" onClick={handleAboutClick}>
            About
          </Button>
          <Button type="default" icon={<BookOutlined />}>
            Saved
          </Button>
        </div>
      </div>
      <AboutModal isOpen={isAboutModalOpen} onClose={handleAboutModalClose} />
    </>
  );
}