import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing to allow re-seeding
  await prisma.userResponse.deleteMany()
  await prisma.examAttempt.deleteMany()
  await prisma.option.deleteMany()
  await prisma.question.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dataleum.com',
      password: passwordHash,
      name: 'System Admin',
      role: 'admin',
    }
  })

  const student = await prisma.user.create({
    data: {
      id: 'user_mock_123', // Keep existing mock ID so current tests pass
      email: 'student@dataleum.com',
      password: passwordHash,
      name: 'Test Student',
      role: 'student',
    }
  })

  // ── MCDA (PL-300) ──
  const mcda = await prisma.exam.create({
    data: {
      title: 'Microsoft Certified: Data Analyst Associate (PL-300)',
      code: 'MCDA-101',
      duration_minutes: 100,
      passing_score: 70,
      total_questions: 50,
      questions: {
        create: [
          {
            domain_topic: 'Prepare the Data',
            question_type: 'single_choice',
            question_text: 'You are connecting to a SQL Server database in Power BI Desktop. You need to import only the rows where the Status column equals "Active". What is the most efficient approach?',
            explanation: 'Writing a native SQL query or using query folding with a filter in Power Query ensures the filter is applied at the data source, minimizing the data transferred to the model.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'Import all data and use a DAX FILTER function on the table', is_correct: false },
                { option_text: 'Apply a filter step in Power Query Editor so query folding pushes the filter to SQL Server', is_correct: true },
                { option_text: 'Create a calculated table with only Active rows', is_correct: false },
                { option_text: 'Use Row Level Security to hide non-Active rows', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Prepare the Data',
            question_type: 'single_choice',
            question_text: 'A Power Query step shows a warning icon indicating that query folding has stopped. What is the most likely cause?',
            explanation: 'Operations like adding a custom column using M logic that has no SQL equivalent will break query folding, causing all subsequent steps to run locally.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'A "Remove Columns" step was added', is_correct: false },
                { option_text: 'A "Group By" step was added after a filter', is_correct: false },
                { option_text: 'A custom column was added using an M function with no SQL equivalent', is_correct: true },
                { option_text: 'The data source is a SQL Server view', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Model the Data',
            question_type: 'single_choice',
            question_text: 'You have a Sales fact table and a Date dimension table. The Date table has columns for Year, Quarter, Month, and Day. What relationship type should you create between Sales and Date?',
            explanation: 'A star schema best practice is a many-to-one relationship from the fact table (Sales, which has many rows per date) to the dimension table (Date, which has one row per date), with a single cross-filter direction from dimension to fact.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'One-to-one with bidirectional cross-filter', is_correct: false },
                { option_text: 'Many-to-one from Sales to Date with single cross-filter direction', is_correct: true },
                { option_text: 'Many-to-many with bidirectional cross-filter', is_correct: false },
                { option_text: 'One-to-many from Sales to Date', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Model the Data',
            question_type: 'single_choice',
            question_text: 'You need to create a proper Date table for time intelligence functions in DAX. Which approach is recommended by Microsoft?',
            explanation: 'CALENDARAUTO() or CALENDAR() in a calculated table is the recommended approach. The table must be marked as a Date table and contain a contiguous range of dates.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'Use the auto date/time feature built into Power BI', is_correct: false },
                { option_text: 'Import dates from an Excel spreadsheet', is_correct: false },
                { option_text: 'Create a calculated table using CALENDARAUTO() and mark it as a Date table', is_correct: true },
                { option_text: 'Reference dates directly from the fact table', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Model the Data',
            question_type: 'multi_select',
            question_text: 'Which of the following are valid reasons to use a star schema in Power BI? (Select 2)',
            explanation: 'Star schemas improve DAX query performance because the engine is optimized for this shape, and they simplify the creation of measures and calculations by providing clear dimension-fact relationships.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'Star schemas improve DAX query performance', is_correct: true },
                { option_text: 'Star schemas eliminate the need for relationships', is_correct: false },
                { option_text: 'Star schemas simplify measure and calculation authoring', is_correct: true },
                { option_text: 'Star schemas automatically enable Row Level Security', is_correct: false },
                { option_text: 'Star schemas increase the storage compression ratio to zero', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Visualize and Analyze the Data',
            question_type: 'single_choice',
            question_text: 'A report user needs to see how total revenue changes over time and also understand the contribution of each product category. Which visualization best meets this requirement?',
            explanation: 'A stacked area chart shows the trend over time and the categorical breakdown, providing both trend and composition analysis in a single view.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'A single pie chart with date as the legend', is_correct: false },
                { option_text: 'A stacked area chart with product category as the legend', is_correct: true },
                { option_text: 'A table with conditional formatting', is_correct: false },
                { option_text: 'A scatter plot with date on the X axis', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Visualize and Analyze the Data',
            question_type: 'single_choice',
            question_text: 'You need to allow report viewers to explore data at different levels of a hierarchy (Year → Quarter → Month). Which interaction feature should you enable?',
            explanation: 'The drill-down feature in Power BI allows users to navigate through hierarchy levels on a visual, going from Year to Quarter to Month.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'Enable cross-filtering between visuals', is_correct: false },
                { option_text: 'Add a slicer for each hierarchy level', is_correct: false },
                { option_text: 'Enable drill-down on the visual hierarchy', is_correct: true },
                { option_text: 'Create bookmarks for each hierarchy level', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Deploy and Maintain Assets',
            question_type: 'single_choice',
            question_text: 'Your organization requires that only users in the Sales department can see sales data for their own region. What Power BI feature should you implement?',
            explanation: 'Row Level Security (RLS) with DAX filters based on USERNAME() or USERPRINCIPALNAME() restricts data visibility per user based on their identity.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'Create separate reports for each region', is_correct: false },
                { option_text: 'Use object-level security (OLS) to hide columns', is_correct: false },
                { option_text: 'Implement Row Level Security (RLS) with dynamic DAX rules', is_correct: true },
                { option_text: 'Set workspace permissions to "Viewer" for each region', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Deploy and Maintain Assets',
            question_type: 'multi_select',
            question_text: 'Which of the following are benefits of using a Power BI deployment pipeline? (Select 2)',
            explanation: 'Deployment pipelines allow you to manage the lifecycle of content (dev → test → production) in a structured way, and they enable comparing content across stages to detect differences before promoting.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'Provides a structured dev → test → production lifecycle', is_correct: true },
                { option_text: 'Automatically writes DAX measures for you', is_correct: false },
                { option_text: 'Enables comparing content across stages before deployment', is_correct: true },
                { option_text: 'Replaces the need for Power BI Desktop entirely', is_correct: false },
              ]
            }
          },
          {
            domain_topic: 'Model the Data',
            question_type: 'single_choice',
            question_text: 'You write the DAX measure: Total Sales = SUM(Sales[Amount]). When this measure is placed on a visual with Product Category on the axis, what determines the value displayed for each category?',
            explanation: 'DAX measures are evaluated within a filter context. When Product Category is on the axis, Power BI creates a filter context for each category, and SUM(Sales[Amount]) is evaluated independently for each.',
            is_verified: true,
            source: 'Official Practice Test',
            options: {
              create: [
                { option_text: 'The row context created by an iterator function', is_correct: false },
                { option_text: 'The filter context created by the visual for each category', is_correct: true },
                { option_text: 'The default ALL() function applied to the measure', is_correct: false },
                { option_text: 'The order of columns in the Sales table', is_correct: false },
              ]
            }
          },
        ]
      }
    }
  })

  // ── PMP (Shell) ──
  const pmp = await prisma.exam.create({
    data: {
      title: 'Project Management Professional (PMP)',
      code: 'PMP-201',
      duration_minutes: 230,
      passing_score: 60,
      total_questions: 180,
    }
  })

  // ── CBAP (Shell) ──
  const cbap = await prisma.exam.create({
    data: {
      title: 'Certified Business Analysis Professional (CBAP)',
      code: 'CBAP-301',
      duration_minutes: 210,
      passing_score: 60,
      total_questions: 120,
    }
  })

  console.log('Seed completed:')
  console.log(`  ✓ ${mcda.title} — 10 questions`)
  console.log(`  ✓ ${pmp.title} — shell (0 questions)`)
  console.log(`  ✓ ${cbap.title} — shell (0 questions)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
