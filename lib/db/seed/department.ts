import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import {
  academicSessionTable,
  departmentTable,
  subjectTable,
} from "@/lib/db/schema";

// Change this number to insert more data in the future
const NUM_RECORDS = 5;

async function main() {
  console.log(`🌱 Seeding ${NUM_RECORDS} records for each independent table...`);
  try {
    // 1. Seed Academic Sessions
    const sessions = Array.from({ length: NUM_RECORDS }).map((_, i) => {
      const startYear = 2020 + i;
      const endYear = startYear + 4;
      return {
        name: `${startYear}-${endYear}`,
        startDate: `${startYear}-07-01`,
        endDate: `${endYear}-06-30`,
        isActive: i === NUM_RECORDS - 1, // Make the last one active
      };
    });
    
    await db.insert(academicSessionTable).values(sessions);
    console.log(`✅ Seeded ${NUM_RECORDS} academic sessions.`);

    // 2. Seed Departments
    const uniqueDeptNames = faker.helpers.uniqueArray(faker.company.name, NUM_RECORDS);
    const uniqueDeptCodes = faker.helpers.uniqueArray(
      () => faker.string.alphanumeric({ length: 8, casing: "upper" }),
      NUM_RECORDS
    );
    const departments = Array.from({ length: NUM_RECORDS }).map((_, i) => ({
      code: uniqueDeptCodes[i],
      name: uniqueDeptNames[i].slice(0, 30),
      description: faker.lorem.sentence().slice(0, 100),
    }));
    
    await db.insert(departmentTable).values(departments);
    console.log(`✅ Seeded ${NUM_RECORDS} departments.`);

    // 3. Seed Subjects
    const uniqueSubjectCodes = faker.helpers.uniqueArray(
      () => faker.string.alphanumeric({ length: 8, casing: "upper" }),
      NUM_RECORDS
    );
    const subjectTypes = ["MJC", "MIC", "MDC", "SEC", "VAC"] as const;
    const subjects = Array.from({ length: NUM_RECORDS }).map((_, i) => ({
      code: uniqueSubjectCodes[i],
      name: `${faker.science.chemicalElement().name} ${faker.word.adjective()} ${i}`.slice(0, 100),
      type: faker.helpers.arrayElement(subjectTypes),
      hasPractical: faker.datatype.boolean(),
    }));
    
    await db.insert(subjectTable).values(subjects);
    console.log(`✅ Seeded ${NUM_RECORDS} subjects.`);

    console.log(`🎉 Successfully seeded independent tables!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding execution failed:", error);
    process.exit(1);
  }
}

main();
