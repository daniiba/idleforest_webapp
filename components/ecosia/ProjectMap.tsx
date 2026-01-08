import { useEffect, useRef, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { CountryHistory } from './CountryHistory';
import { Card } from "@/components/ui/card";

interface ProjectLocation {
  name: string;
  lat: number;
  lng: number;
  money: number;
  historicalData: Array<{ period: string; money: number }>;
  projectDetails: {
    startYear: number;
    partners: string[];
    image?: {
      url: string;
      alt: string;
    };
  };
  url?: string;
  image?: Array<{
    url: string;
    thumbnails: {
      small: { url: string };
      large: { url: string };
      full: { url: string };
    };
  }>;
}

interface ProjectMapProps {
  apiKey?: string;
  projects: ProjectLocation[];
}

export function ProjectMap({
  apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || '',
  projects
}: ProjectMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markers = useRef<maptilersdk.Marker[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    maptilersdk.config.apiKey = apiKey;

    const initializeMap = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS.DARK,
      center: [0, 20],
      zoom: 2
    });

    map.current = initializeMap;

    initializeMap.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      initializeMap.remove();
    };
  }, [apiKey]);

  // Add markers once map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    projects.forEach((project) => {
      const marker = new maptilersdk.Marker({ color: "#E0F146" })
        .setLngLat([project.lng, project.lat])
        .setPopup(
          new maptilersdk.Popup({ offset: 25 }).setHTML(
            `<div style="padding:12px;background-color:#0B101F;color:#fff;border:2px solid #E0F146;border-radius:8px;">
              <h3 style="font-size:1.125rem;font-weight:700;margin:0 0 8px 0;">${project.name}</h3>
              <p style="color:#d1d5db;margin:0;">Money Invested: €${project.money.toLocaleString()}</p>
              <p style="color:#d1d5db;margin:4px 0 0 0;">Start Year: ${project.projectDetails.startYear}</p>
            </div>`
          )
        )
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        setSelectedProject(project);
      });

      markers.current.push(marker);
    });
  }, [projects, mapLoaded]);

  return (
    <Card className="bg-gray-950 backdrop-blur-sm border-2 border-brand-yellow p-6">
      <div className="space-y-4">
        <div
          ref={mapContainer}
          className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-brand-yellow/50"
        />
        {selectedProject && (
          <CountryHistory
            name={selectedProject.name}
            money={selectedProject.money}
            historicalData={selectedProject.historicalData}
            projectDetails={{
              ...selectedProject.projectDetails,
              image: selectedProject.image?.[0] ? {
                url: selectedProject.image[0].thumbnails.large.url,
                alt: `${selectedProject.name} project image`
              } : undefined
            }}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </Card>
  );
}