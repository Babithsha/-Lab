import mongoose, { Schema, Model } from 'mongoose';

// User Schema
interface IUser {
    _id?: string;
    name: string;
    email: string;
    password?: string;
    role: string;
    image?: string;
    oldId?: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, required: true, enum: ['student', 'technician', 'admin', 'Admin', 'Technician', 'Student'] },
    image: { type: String },
    oldId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Equipment Schema
interface IEquipment {
    _id?: string;
    name: string;
    category?: string;
    lab?: string;
    status?: string;
    description?: string;
    quantity?: number;
    available?: number;
    oldId?: string;
    createdAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>({
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    lab: { type: String },
    status: { type: String, default: 'Available' },
    description: { type: String },
    quantity: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    oldId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Booking Schema
interface IBooking {
    _id?: string;
    user?: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    equipment?: string;
    equipmentId?: string;
    equipmentName?: string;
    lab?: string;
    date: string;
    time?: string;
    duration?: string;
    purpose?: string;
    status: string;
    staffNotes?: string;
    damageFine?: number;
    damageDescription?: string;
    damageReportedBy?: string;
    damageFineAddedAt?: string;
    oldId?: string;
    createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
    user: { type: String },
    userId: { type: String },
    userEmail: { type: String },
    userName: { type: String },
    equipment: { type: String },
    equipmentId: { type: String },
    equipmentName: { type: String },
    lab: { type: String },
    date: { type: String, required: true },
    time: { type: String },
    duration: { type: String },
    purpose: { type: String },
    status: { type: String, required: true, default: 'pending' },
    staffNotes: { type: String },
    damageFine: { type: Number },
    damageDescription: { type: String },
    damageReportedBy: { type: String },
    damageFineAddedAt: { type: String },
    oldId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Announcement Schema
interface IAnnouncement {
    _id?: string;
    title: string;
    message?: string;
    description?: string;
    type?: string;
    priority?: string;
    oldId?: string;
    createdAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>({
    title: { type: String, required: true },
    message: { type: String },
    description: { type: String },
    type: { type: String, default: 'info' },
    priority: { type: String, default: 'normal' },
    oldId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Lab Schema
interface ILab {
    _id?: string;
    name: string;
    description?: string;
    location?: string;
    capacity?: number;
    oldId?: string;
    createdAt: Date;
}

const LabSchema = new Schema<ILab>({
    name: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    capacity: { type: Number },
    oldId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Experiment Schema
interface IExperiment {
    _id?: string;
    title: string;
    description?: string;
    procedure?: string;
    equipmentRequired?: string[];
    difficulty?: string;
    duration?: string;
    addedBy?: string;
    oldId?: string;
    createdAt: Date;
}

const ExperimentSchema = new Schema<IExperiment>({
    title: { type: String, required: true },
    description: { type: String },
    procedure: { type: String },
    equipmentRequired: [{ type: String }],
    difficulty: { type: String },
    duration: { type: String },
    addedBy: { type: String },
    oldId: { type: String },
    createdAt: { type: Date, default: Date.now },
});

// Create or retrieve models (prevent recompilation in development)
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Equipment: Model<IEquipment> = mongoose.models.Equipment || mongoose.model<IEquipment>('Equipment', EquipmentSchema);
export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export const Lab: Model<ILab> = mongoose.models.Lab || mongoose.model<ILab>('Lab', LabSchema);
export const Experiment: Model<IExperiment> = mongoose.models.Experiment || mongoose.model<IExperiment>('Experiment', ExperimentSchema);

// Export interfaces for use in other files
export type { IUser, IEquipment, IBooking, IAnnouncement, ILab, IExperiment };
