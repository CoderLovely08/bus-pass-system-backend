import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed...");

    // Clean up existing data
    await prisma.conductorScan.deleteMany({});
    await prisma.busPass.deleteMany({});
    await prisma.passApproval.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.passApplication.deleteMany({});
    await prisma.passType.deleteMany({});
    await prisma.systemUsersInfo.deleteMany({});
    await prisma.userType.deleteMany({});

    // Create user types
    console.log("Creating user types...");
    const adminType = await prisma.userType.create({
        data: {
            name: "Admin",
            isActive: true,
        },
    });

    const passengerType = await prisma.userType.create({
        data: {
            name: "Passenger",
            isActive: true,
        },
    });

    const conductorType = await prisma.userType.create({
        data: {
            name: "Conductor",
            isActive: true,
        },
    });

    console.log("Creating User Types...");

    // Create a hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Pass@1234", salt);

    // Create admin user
    const admin = await prisma.systemUsersInfo.create({
        data: {
            email: "admin@bps.com",
            password: hashedPassword,
            fullName: "Admin User",
            userTypeId: adminType.id,
        },
    });

    const conductor = await prisma.systemUsersInfo.create({
        data: {
            email: "conductor@bps.com",
            password: hashedPassword,
            fullName: "Conductor User",
            userTypeId: conductorType.id,
        },
    });
    
    console.log("Creating pass types...");
    const passTypes = await prisma.passType.createMany({
        data: [
            {
                name: "Weekly Pass",
                description: "Valid for 7 days from the date of issue",
                durationDays: 7,
                price: 175,
                isActive: true,
                perDayLimit: 3,
            },
            {
                name: "Monthly Pass",
                description: "Valid for 30 days from the date of issue",
                durationDays: 30,
                price: 750,
                isActive: true,
                perDayLimit: 5,
            },
            {
                name: "Quarterly Pass",
                description: "Valid for 90 days from the date of issue",
                durationDays: 90,
                price: 2000,
                isActive: true,
                perDayLimit: 10,
            },
        ],
    });

    console.log("Pass types created successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
