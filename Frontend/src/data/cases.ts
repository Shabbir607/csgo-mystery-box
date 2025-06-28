import { CSGOCase } from '../types';
import { csgoWeapons } from './csgoWeapons';

// Helper function to get weapons by IDs
const getWeaponsByIds = (ids: string[]) => {
  return ids.map(id => csgoWeapons.find(weapon => weapon.id === id)).filter(Boolean) as any[];
};

export const cases: CSGOCase[] = [
  {
    id: 'spectrum-case',
    name: 'Spectrum Case',
    price: 2.50,
    image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400',
    items: getWeaponsByIds([
      'p250-sand-dune',
      'mp9-storm',
      'nova-predator',
      'mac10-heat',
      'tec9-brass',
      'ak47-blue-laminate',
      'm4a4-faded-zebra',
      'ak47-redline',
      'm4a1s-cyrex',
      'ak47-fire-serpent',
      'karambit-fade',
      'bayonet-tiger-tooth'
    ]),
  },
  {
    id: 'chroma-case',
    name: 'Chroma Case',
    price: 2.75,
    image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400',
    items: getWeaponsByIds([
      'p250-sand-dune',
      'mp9-storm',
      'five-seven-forest-leaves',
      'tec9-brass',
      'glock18-water-elemental',
      'desert-eagle-blaze',
      'awp-asiimov',
      'usp-s-kill-confirmed',
      'awp-dragon-lore',
      'butterfly-knife-crimson-web'
    ]),
  },
  {
    id: 'operation-case',
    name: 'Operation Hydra Case',
    price: 3.25,
    image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400',
    items: getWeaponsByIds([
      'nova-predator',
      'sawed-off-sage-spray',
      'mac10-heat',
      'awp-safari-mesh',
      'p90-asiimov',
      'ak47-vulcan',
      'm4a4-desolate-space',
      'm4a4-howl',
      'm9-bayonet-doppler'
    ]),
  },
  {
    id: 'danger-zone',
    name: 'Danger Zone Case',
    price: 1.80,
    image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400',
    items: getWeaponsByIds([
      'p250-sand-dune',
      'mp9-storm',
      'nova-predator',
      'mac10-heat',
      'five-seven-forest-leaves',
      'ak47-blue-laminate',
      'famas-afterimage',
      'awp-hyper-beast',
      'flip-knife-marble-fade'
    ]),
  },
  {
    id: 'prisma-case',
    name: 'Prisma Case',
    price: 4.50,
    image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400',
    items: getWeaponsByIds([
      'tec9-brass',
      'five-seven-forest-leaves',
      'glock18-water-elemental',
      'galil-ar-eco',
      'mp7-nemesis',
      'ump45-primal-saber',
      'ak47-vulcan',
      'ssg08-blood-in-the-water',
      'gut-knife-doppler',
      'huntsman-knife-fade'
    ]),
  },
  {
    id: 'revolution-case',
    name: 'Revolution Case',
    price: 5.00,
    image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400',
    items: getWeaponsByIds([
      'glock18-water-elemental',
      'desert-eagle-blaze',
      'p90-asiimov',
      'famas-afterimage',
      'galil-ar-eco',
      'm4a4-desolate-space',
      'awp-hyper-beast',
      'ssg08-blood-in-the-water',
      'falchion-knife-crimson-web',
      'shadow-daggers-fade',
      'bowie-knife-tiger-tooth'
    ]),
  },
];