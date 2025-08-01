import { Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <InfoCircleOutlined />
          <span>About</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="about-modal"
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >
      <div className="space-y-4">
        <div>
          <p className="text-gray-700">
            Atlanta Property Map is an interactive web application that provides detailed information about properties 
            across the Atlanta metropolitan area. This tool helps users explore property data including ownership, 
            appraised values, property characteristics, and historical sales information.
          </p>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-2">Key Features</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 [&>li]:pl-0">
            <li>Interactive map with property locations and boundaries</li>
            <li>Search functionality by address or parcel ID</li>
            <li>Detailed property information including ownership and values</li>
            <li>Filter properties by various criteria</li>
          </ul>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-2">Data Sources</h3>
          <p className="text-gray-700">
            Property data is sourced from county tax assessor offices and public records. 
            The information includes parcel boundaries, ownership details, appraised values, 
            and property characteristics such as square footage, bedrooms, and bathrooms.
          </p>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-2">Tech Stack</h3>
          <span>Next.js 14, React, TypeScript, Ant Design, Tailwind CSS, Leaflet, SQLite</span>
        </div>
      </div>
    </Modal>
  );
} 