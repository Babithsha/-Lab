
import { Equipment } from './models';

const realEquipmentData = [
    {
        name: "Digital Oscilloscope",
        category: "Electronics",
        status: "Available",
        quantity: 10,
        description: "100MHz 2-Channel Digital Storage Oscilloscope",
        lastCalibrated: "2025-01-15"
    },
    {
        name: "Function Generator",
        category: "Electronics",
        status: "Available",
        quantity: 8,
        description: "20MHz Arbitrary Waveform Generator",
        lastCalibrated: "2025-02-01"
    },
    {
        name: "Digital Multimeter",
        category: "Electronics",
        status: "Available",
        quantity: 20,
        description: "True RMS Digital Multimeter with Temperature",
        lastCalibrated: "2025-01-10"
    },
    {
        name: "Compound Microscope",
        category: "Biology",
        status: "Available",
        quantity: 15,
        description: "Binocular Compound Microscope with 1000x magnification",
        lastCalibrated: "2024-12-20"
    },
    {
        name: "Spectrophotometer",
        category: "Chemistry",
        status: "Available",
        quantity: 2,
        description: "UV-Vis Spectrophotometer for localized analysis",
        lastCalibrated: "2024-11-30"
    },
    {
        name: "Centrifuge",
        category: "Biology",
        status: "Available",
        quantity: 4,
        description: "High-speed laboratory centrifuge",
        lastCalibrated: "2025-01-05"
    },
    {
        name: "PH Meter",
        category: "Chemistry",
        status: "Available",
        quantity: 12,
        description: "Digital PH Meter with automatic temperature compensation",
        lastCalibrated: "2025-02-10"
    },
    {
        name: "Fume Hood",
        category: "Safety",
        status: "Available",
        quantity: 3,
        description: "Chemical fume hood for safe handling of volatile chemicals",
        lastCalibrated: "2025-01-20"
    }
];

export async function seedRealData() {
    console.log("Seeding real data...");

    // Check if equipment exists, if not seed
    const existing = await Equipment.find();
    if (existing.length === 0) {
        for (const item of realEquipmentData) {
            await Equipment.create(item);
        }
        console.log("Real equipment data seeded.");
    } else {
        console.log("Equipment data already exists, skipping seed.");
    }
}
