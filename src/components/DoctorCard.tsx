import { MapPin, Clock, Users } from 'lucide-react';
import { Doctor } from '../lib/supabase';
import StarRating from './StarRating';

const specializationColors: Record<string, string> = {
  General: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Dental: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Dermatology: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  ENT: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Pediatrics: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cardiology: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Orthopedics: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

const clinicImages = [
  'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg?auto=compress&cs=tinysrgb&w=400',
];

function getImageForDoctor(doctorId: string) {
  const idx = doctorId.charCodeAt(doctorId.length - 1) % clinicImages.length;
  return clinicImages[idx];
}

interface DoctorCardProps {
  doctor: Doctor;
  onClick: (doctor: Doctor) => void;
}

export default function DoctorCard({ doctor, onClick }: DoctorCardProps) {
  const colorClass = specializationColors[doctor.specialization] ?? 'bg-gray-100 text-gray-700';

  return (
    <div
      onClick={() => onClick(doctor)}
      className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden hover:-translate-y-0.5"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={getImageForDoctor(doctor.id)}
          alt={doctor.clinic_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {doctor.specialization}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
            {doctor.full_name}
          </h3>
          <StarRating rating={doctor.rating} />
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-3">{doctor.clinic_name}</p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{doctor.city}, {doctor.state}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{doctor.consultation_duration_mins} min consultation</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{doctor.review_count} reviews</span>
          </div>
        </div>

        <button className="mt-4 w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
          Book Appointment
        </button>
      </div>
    </div>
  );
}
