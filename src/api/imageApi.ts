
import { MediaItem, MediaListResponse } from '@/types/gallery';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

console.log("API Base URL:", API_BASE_URL);

export interface DirectoryNode {
  id: string;
  name: string;
  children?: DirectoryNode[];
}

export interface DetailedMediaInfo {
  alt: string;
  createdAt: string | null;
  name?: string;
  path?: string;
  size?: string;
  cameraModel?: string;
  hash?: string;
  duplicatesCount?: number;
  dimensions?: string;
  iso?: string;
  focalLength?: string;
  exposureTime?: string;
  aperture?: string;
}

// Liste des modèles d'appareils photo pour les données mock
const CAMERA_MODELS = [
  "iPhone 13 Pro", "iPhone 14 Pro Max", "iPhone 15 Pro", 
  "Samsung Galaxy S22 Ultra", "Samsung Galaxy S23", 
  "Google Pixel 7 Pro", "Google Pixel 8", 
  "Canon EOS 5D Mark IV", "Canon EOS R5", "Canon EOS 90D",
  "Nikon Z6 II", "Nikon D850", "Nikon Z9",
  "Sony Alpha A7R IV", "Sony Alpha A7 III", "Sony Alpha A1",
  "Fujifilm X-T4", "Fujifilm X-H2", "Fujifilm GFX 100S",
  "Panasonic Lumix GH6", "Panasonic S5", 
  "Olympus OM-D E-M1 Mark III", "Olympus PEN-F"
];

// Liste des dimensions d'image courantes pour les données mock
const IMAGE_DIMENSIONS = [
  "6000 x 4000", "5472 x 3648", "4032 x 3024", 
  "3840 x 2160", "3024 x 4032", "2048 x 1536",
  "7680 x 4320", "8192 x 5464", "2736 x 1824"
];

// Liste d'extensions de fichiers courantes pour les données mock
const FILE_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".heic", ".raw", ".dng", ".cr2", ".nef",
  ".mp4", ".mov", ".avi", ".webm"
];

// Fonction pour générer une date aléatoire dans les 3 dernières années
function randomDate() {
  const now = new Date();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(now.getFullYear() - 3);
  
  return new Date(
    threeYearsAgo.getTime() + Math.random() * (now.getTime() - threeYearsAgo.getTime())
  ).toISOString();
}

// Fonction pour générer une taille de fichier aléatoire entre 500KB et 20MB
function randomFileSize() {
  const size = Math.floor(Math.random() * 19500) + 500; // Entre 500KB et 20000KB
  
  if (size >= 1000) {
    return `${(size / 1000).toFixed(2)} MB`;
  }
  return `${size} KB`;
}

// Fonction pour générer un hash unique
function generateHash() {
  return Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export async function fetchDirectoryTree(position?: 'left' | 'right'): Promise<DirectoryNode[]> {
  // Convert position to directory parameter for API consistency
  const directory = position === 'left' ? 'source' : position === 'right' ? 'destination' : undefined;
  
  const url = `${API_BASE_URL}/tree${directory ? `?directory=${directory}` : ''}`;
  console.log(`Fetching directory tree from: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch directory tree: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Received directory tree for ${directory || 'default'}:`, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching directory tree for ${directory || 'default'}:`, error);
    
    // Return mock data in case of errors for development
    const mockData = [
      { 
        id: `photos-${position || 'default'}`, 
        name: "Photos", 
        children: [
          { id: `vacances-${position || 'default'}`, name: "Vacances", children: [] },
          { id: `famille-${position || 'default'}`, name: "Famille", children: [] },
          { id: `evenements-${position || 'default'}`, name: "Évènements", children: [] }
        ] 
      },
      { 
        id: `videos-${position || 'default'}`, 
        name: "Vidéos", 
        children: [
          { id: `films-${position || 'default'}`, name: "Films", children: [] },
          { id: `clips-${position || 'default'}`, name: "Clips", children: [] }
        ] 
      }
    ];
    
    console.log(`Using mock directory data for ${position || 'default'}:`, mockData);
    return mockData;
  }
}

export async function fetchMediaIds(directory: string, position: 'source' | 'destination', filter: string = 'all'): Promise<MediaListResponse> {
  const url = `${API_BASE_URL}/list?directory=${encodeURIComponent(position)}&folder=${encodeURIComponent(directory)}${filter !== 'all' ? `&filter=${filter}` : ''}`;
  console.log("Fetching media IDs from:", url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to fetch media IDs: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Received media data:", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching media data:", error);
    
    console.log("Using mock media data due to error");
    
    // Générer des médias sur 5 ans avec une distribution variable par mois
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 5); // Commencer il y a 5 ans
    const endDate = new Date(); // Aujourd'hui
    
    const mockMediaIds: string[] = [];
    const mockMediaDates: string[] = [];
    
    // Fonction pour formater une date en YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.toISOString().substring(0, 10);
    };
    
    // Parcourir chaque mois sur 5 ans
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      // Nombre de photos pour ce mois (entre 10 et 200)
      const photosCount = Math.floor(Math.random() * 191) + 10;
      
      // Générer des ID et des dates pour ce mois
      for (let i = 0; i < photosCount; i++) {
        // Créer une date aléatoire dans ce mois
        const day = Math.floor(Math.random() * 28) + 1; // Éviter les problèmes de mois à 30/31 jours
        const randomDate = new Date(year, month, day);
        
        // Si on dépasse la date actuelle, arrêter
        if (randomDate > endDate) break;
        
        // Ajouter l'ID et la date
        // Générer un ID unique avec le mois/année intégré pour assurer une cohérence
        const idSuffix = `${year}${(month + 1).toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${i.toString().padStart(4, '0')}`;
        
        // Déterminer si c'est une image ou une vidéo (80% d'images, 20% de vidéos)
        const isVideo = Math.random() < 0.2;
        const mediaId = isVideo ? 
          `${position}-${directory}-vid-${idSuffix}` : 
          `${position}-${directory}-img-${idSuffix}`;
        
        mockMediaIds.push(mediaId);
        mockMediaDates.push(formatDate(randomDate));
      }
      
      // Passer au mois suivant
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Trier par date décroissante (plus récent en premier)
    const sortedMediaArray = mockMediaIds.map((id, index) => ({
      id,
      date: mockMediaDates[index]
    })).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Reconstruire les tableaux triés
    const sortedMediaIds = sortedMediaArray.map(item => item.id);
    const sortedMediaDates = sortedMediaArray.map(item => item.date);
    
    console.log(`Generated ${sortedMediaIds.length} mock media IDs with directory ${directory}`);
    return {
      mediaIds: sortedMediaIds,
      mediaDates: sortedMediaDates
    };
  }
}

export async function fetchMediaInfo(id: string, position: 'source' | 'destination'): Promise<DetailedMediaInfo> {
  const url = `${API_BASE_URL}/info?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
  console.log(`Fetching media info for ID ${id} from:`, url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Server error for media info (ID: ${id}):`, response.status);
      throw new Error(`Failed to fetch media info: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Media info for ID ${id}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching media info for ID ${id}:`, error);
    
    // Déterminer si c'est une image ou une vidéo basé sur l'ID
    const isVideo = id.includes('vid-');
    
    // Générer une extension de fichier appropriée
    let extension = FILE_EXTENSIONS[Math.floor(Math.random() * (isVideo ? 4 : 8) + (isVideo ? 8 : 0))];
    
    // Générer un nom de fichier réaliste
    const fileName = isVideo ? 
      `VID_${Math.floor(Math.random() * 9000) + 1000}${extension}` : 
      `IMG_${Math.floor(Math.random() * 9000) + 1000}${extension}`;
    
    // Générer un chemin de fichier réaliste
    const basePath = `/media/${position === 'source' ? 'source' : 'destination'}`;
    const subFolder = isVideo ? 'videos' : 'photos';
    const yearFolder = `${2021 + Math.floor(Math.random() * 3)}`;
    const monthFolder = `${Math.floor(Math.random() * 12) + 1}`.padStart(2, '0');
    
    const mockInfo: DetailedMediaInfo = { 
      alt: fileName,
      createdAt: randomDate(),
      name: fileName,
      path: `${basePath}/${subFolder}/${yearFolder}/${monthFolder}/${fileName}`,
      size: randomFileSize(),
      cameraModel: CAMERA_MODELS[Math.floor(Math.random() * CAMERA_MODELS.length)],
      hash: generateHash(),
      duplicatesCount: Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 1 : 0, // 20% de chance d'avoir des doublons
      dimensions: isVideo ? "1920 x 1080" : IMAGE_DIMENSIONS[Math.floor(Math.random() * IMAGE_DIMENSIONS.length)],
      iso: isVideo ? undefined : `ISO ${[100, 200, 400, 800, 1600, 3200][Math.floor(Math.random() * 6)]}`,
      focalLength: isVideo ? undefined : `${[24, 35, 50, 85, 105, 135][Math.floor(Math.random() * 6)]}mm`,
      exposureTime: isVideo ? undefined : `1/${[8, 15, 30, 60, 125, 250, 500, 1000][Math.floor(Math.random() * 8)]}s`,
      aperture: isVideo ? undefined : `f/${[1.4, 1.8, 2.0, 2.8, 3.5, 4.0, 5.6][Math.floor(Math.random() * 7)]}`
    };
    
    console.log(`Using mock media info for ${id}:`, mockInfo);
    return mockInfo;
  }
}

// Fonction pour obtenir une URL de picsum aléatoire
function getRandomPicsumUrl(id: string, width: number, height: number): string {
  // Extraire un nombre de l'ID pour avoir une image cohérente par ID
  const seed = parseInt(id.replace(/\D/g, '').slice(0, 3)) || Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Fonction pour obtenir une URL de vidéo placeholder aléatoire
function getRandomVideoUrl(): string {
  // Utiliser des vidéos de placeholder.com
  const colors = ['054A91', '3E7CB1', '81A4CD', 'DBE4EE', '0C0A3E', '7B1E7A', 'F9564F', '3C3C3B'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return `https://via.placeholder.com/640x360/${color}/FFFFFF?text=Video`;
}

// Ces fonctions sont maintenant des utilitaires pour obtenir les URLs
export function getThumbnailUrl(id: string, position: 'source' | 'destination'): string {
  // Si c'est un ID mock, retourner une image de Picsum ou un placeholder vidéo
  if (id.includes('img-') || id.includes('vid-')) {
    if (id.includes('vid-')) {
      return getRandomVideoUrl();
    }
    return getRandomPicsumUrl(id, 300, 300);
  }
  return `${API_BASE_URL}/thumbnail?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
}

export function getMediaUrl(id: string, position: 'source' | 'destination'): string {
  // Si c'est un ID mock, retourner une image de Picsum ou un placeholder vidéo en plus grande taille
  if (id.includes('img-') || id.includes('vid-')) {
    if (id.includes('vid-')) {
      return getRandomVideoUrl();
    }
    return getRandomPicsumUrl(id, 800, 800);
  }
  return `${API_BASE_URL}/media?id=${encodeURIComponent(id)}&directory=${encodeURIComponent(position)}`;
}

export async function deleteImages(imageIds: string[], directory: 'source' | 'destination'): Promise<{ success: boolean, message: string }> {
  const url = `${API_BASE_URL}/images?directory=${encodeURIComponent(directory)}`;
  console.log("Deleting images at:", url, "IDs:", imageIds);
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageIds }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server responded with error:", response.status, errorText);
      throw new Error(`Failed to delete images: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Delete response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting images:", error);
    
    // Return mock response for development
    console.log("Using mock delete response due to error");
    return { success: true, message: `Successfully deleted ${imageIds.length} image(s)` };
  }
}
