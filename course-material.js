import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://jeksrwrzzrczamxijvwl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla3Nyd3J6enJjemFteGlqdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYyMjAsImV4cCI6MjA5NDI1MjIyMH0.1poYpJKNFEVe2NTBkXBTH2bIHGk2yT8aqCU-OlJc4vs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// COMPLETE COURSE MATERIAL FROM LEARNER HUB
// ============================================

const courseMaterial = {
    // 7 Main Courses
    courses: [
        {
            id: 1,
            title: '🚗 Learner Hub',
            category: 'learner',
            description: 'Complete NTSA-approved driver training for new drivers. Covers all 21 units from introduction to advanced driving techniques.',
            full_description: `The Learner Hub is a comprehensive driver training program approved by NTSA.

📚 WHAT YOU'LL LEARN:
• Unit 1: Introduction to Driving - Motor vehicle basics and driver responsibility
• Unit 2: Fundamental Driving Rules - Traffic Act, Highway Code, road regulations
• Unit 3: Model Town - One-way roads, two-way roads, roundabouts, parking
• Unit 4: Human Factors in Traffic - Observation, fatigue, distractions, alcohol effects
• Unit 5: Vehicle Constructions - Steering, brakes, gears, mirrors, engine systems
• Unit 6: Self-Inspection - Pre-journey checklist, tyres, lights, emergency equipment
• Unit 7: Observation - Mirror usage, blind spots, hazard identification
• Unit 8: Vehicle Control - Starting, stopping, gears, parking, turns
• Unit 9: Communication - MSM technique, hand signals, traffic lights
• Unit 10: Speed Management - 4-second rule, braking distance, stopping distance
• Unit 11: Space Management - Open/closed conditions, space envelope
• Unit 12: Emergency Manoeuvres - Brake failure, blowouts, defensive driving
• Unit 13: Skid Control - Front/rear skids, aquaplaning, recovery techniques
• Unit 14: Adverse Conditions - Night, fog, rain, reduced traction driving
• Unit 15: Preventive Maintenance - Inspections, lubrication, troubleshooting
• Unit 16: Conditions of Carriage - PSV requirements, load limits, customer rights
• Unit 17: Hazardous Materials - 9 classes, handling requirements, licensing
• Unit 18: Emergency Procedures - Crash scene management, First Aid (Dr. A.B.C)
• Unit 19: Work Planning - Trip planning, fatigue prevention, legal limits
• Unit 20: Customer Care - Communication, handling expectations, anti-discrimination
• Unit 21: Examination Prep - 1000+ practice questions, NTSA exam preparation

🎯 KEY TOPICS COVERED:
• Kenyan traffic laws and Highway Code
• Model town navigation (one-way, two-way, roundabouts)
• Vehicle controls and self-inspection
• MSM communication technique
• Speed and space management
• Emergency manoeuvres and skid recovery
• Defensive driving techniques

✅ INCLUDES:
• Certificate upon completion
• Practice quizzes
• Final examination preparation
• Lifetime access to materials`,
            type: 'premium',
            price: 5000,
            duration: '40 hours',
            level: 'Beginner to Advanced',
            image_url: '/images/learner-hub.jpg',
            modules: 21,
            exam_ready: true
        },
        {
            id: 2,
            title: '🚌 PSV (Public Service Vehicle)',
            category: 'psv',
            description: 'Specialized training for matatu, bus, and taxi drivers focusing on passenger safety, commercial regulations, and customer service.',
            full_description: `The PSV Course is designed specifically for public service vehicle operators.

📋 COURSE MODULES:
• PSV Licensing requirements (NTSA)
• Passenger safety and rights
• Route planning and time management
• Defensive driving for commercial vehicles
• Customer service excellence
• Fare management and ticketing systems
• Vehicle inspection for PSV
• Emergency procedures with passengers
• Load management and luggage handling
• PSV code of conduct
• Speed governor compliance
• Rest hour management (max 8 hours driving)

🎯 KEY FOCUS AREAS:
• Traffic Act regulations for PSV operators
• Passenger counting and safety
• Accident reporting procedures
• Handling difficult passengers
• Lost property procedures
• Cash and fare management
• Route optimization

✅ CERTIFICATION:
• NTSA PSV Certificate
• Defensive driving certification
• Customer service excellence badge
• First aid certified`,
            type: 'premium',
            price: 7500,
            duration: '25 hours',
            level: 'Intermediate',
            image_url: '/images/psv-course.jpg',
            modules: 12,
            exam_ready: true
        },
        {
            id: 3,
            title: '🚸 School Bus/Van Driver',
            category: 'school-bus',
            description: 'Specialized safety training for school transport drivers focusing on child safety, route management, and emergency protocols.',
            full_description: `The School Transport Safety Course is designed for drivers transporting students.

📋 CORE MODULES:
• Child passenger safety protocols
• Loading and unloading procedures
• Student behaviour management
• Emergency evacuation drills
• First aid for children
• Route risk assessment
• Vehicle inspection for school transport
• Communication with schools and parents
• Anti-bullying on transport
• Special needs student transport
• No child left behind procedures
• Student tracking systems

🎯 SAFETY FOCUS:
• School zone speed management
• Stop arm compliance
• Crossing guard protocols
• Emergency contact procedures
• Weather-related safety
• Student attendance tracking

✅ CERTIFICATION:
• School Transport Safety Certificate
• Pediatric First Aid certified
• Defensive Driving certified
• Background check clearance
• Child protection certified`,
            type: 'premium',
            price: 6500,
            duration: '20 hours',
            level: 'Intermediate',
            image_url: '/images/school-bus.jpg',
            modules: 10,
            exam_ready: true
        },
        {
            id: 4,
            title: '⚡ EV Vehicle Course',
            category: 'ev',
            description: 'Master electric vehicle driving, charging management, and EV-specific safety protocols for modern sustainable transport.',
            full_description: `The Electric Vehicle (EV) Course covers everything about modern EVs.

📋 EV-SPECIFIC TRAINING:
• EV vehicle controls and dashboard
• Regenerative braking systems
• Battery management and range optimization
• Charging station types (Level 1, 2, 3)
• Public vs home charging
• EV maintenance (no oil changes, battery health)
• EV safety (high voltage systems)
• Silent operation awareness for pedestrians
• Range anxiety management
• Emergency procedures for EVs
• Thermal management systems

🎯 TECHNICAL KNOWLEDGE:
• Battery degradation factors
• Charging time calculations
• Cost comparison (EV vs fuel)
• Eco-driving techniques
• Regenerative braking mastery
• Route planning for charging

✅ CERTIFICATION:
• EV Driver Certification
• Eco-driving Specialist
• Charging Network Pro
• Green Transport Ambassador`,
            type: 'premium',
            price: 8000,
            duration: '15 hours',
            level: 'Beginner to Intermediate',
            image_url: '/images/ev-course.jpg',
            modules: 8,
            exam_ready: true
        },
        {
            id: 5,
            title: '🛵 Boda Boda (Motorcycle)',
            category: 'boda-boda',
            description: 'Professional motorcycle taxi training covering safety, passenger transport, and defensive riding techniques.',
            full_description: `The Boda Boda Professional Course is for motorcycle taxi operators.

📋 CORE TRAINING:
• Motorcycle controls and balance
• Protective gear (helmet, jacket, gloves)
• Passenger safety protocols
• Luggage and cargo management
• Defensive riding techniques
• Night riding safety
• Wet weather riding
• Emergency braking and swerving
• Pillion passenger communication
• Route optimization for deliveries
• App-based dispatch systems

🎯 PROFESSIONAL SKILLS:
• Pricing and fare negotiation
• Customer service for riders
• First aid for accidents
• Breakdown procedures
• Insurance requirements
• NTSA motorcycle regulations
• Road tax and licensing

✅ CERTIFICATION:
• Professional Boda Boda License
• Defensive Riding Certificate
• First Aid certified
• Customer Service Excellence
• NTSA motorcycle endorsement`,
            type: 'premium',
            price: 5500,
            duration: '20 hours',
            level: 'Beginner',
            image_url: '/images/boda-boda.jpg',
            modules: 10,
            exam_ready: true
        },
        {
            id: 6,
            title: '📚 e-Safety Library',
            category: 'safety',
            description: 'Free comprehensive road safety resources, guides, and educational materials for all road users.',
            full_description: `The e-Safety Library provides FREE access to road safety resources.

📖 SAFETY RESOURCES:
• Road safety guides for pedestrians
• Cyclist safety handbook
• Child road safety education
• Elderly road user guidelines
• Defensive driving articles
• Weather-specific driving tips
• Emergency response guides
• First aid reference manual
• Traffic Act and Highway Code reference
• Seasonal safety campaigns

📋 INTERACTIVE CONTENT:
• Safety quizzes and assessments
• Infographics and posters
• Video tutorials
• Case studies of common accidents
• Downloadable PDF guides
• Safety tips newsletter

🆓 COMPLETELY FREE - No payment required
• Unlimited access to all resources
• Regular safety updates
• Community forum access
• No subscription needed`,
            type: 'free',
            price: 0,
            duration: 'Self-paced',
            level: 'All levels',
            image_url: '/images/safety-library.jpg',
            modules: 15,
            exam_ready: false
        },
        {
            id: 7,
            title: '📝 Quiz Bank (1000+ Questions)',
            category: 'quiz',
            description: 'Comprehensive exam preparation with 1000+ NTSA-style practice questions covering all driving categories.',
            full_description: `The Ultimate Quiz Bank features 1000+ NTSA-style questions.

📊 QUESTION CATEGORIES:
• Road signs (200+ questions)
• Traffic Act regulations (150+)
• Vehicle controls and maintenance (100+)
• Defensive driving scenarios (150+)
• Emergency procedures (100+)
• PSV specific (100+)
• Motorcycle specific (100+)
• EV specific (50+)
• Model town navigation (50+)
• First aid and safety (50+)

🎯 QUIZ FEATURES:
• Timed practice tests
• Category-specific quizzes
• Random question generator
• Progress tracking
• Weak area identification
• Detailed answer explanations
• Mock NTSA examinations

📈 EXAM SIMULATION:
• Real NTSA exam format
• Time limits per section
• Pass/fail scoring
• Review incorrect answers
• Track improvement over time
• Certificate of completion

✅ INCLUDES:
• Mobile-friendly interface
• Offline mode available
• Progress sync across devices
• Lifetime access to updates`,
            type: 'premium',
            price: 3000,
            duration: 'Self-paced',
            level: 'All levels',
            image_url: '/images/quiz-bank.jpg',
            modules: 10,
            exam_ready: true,
            questions: '1000+'
        }
    ],
    
    // Traffic Signs
    trafficSigns: [
        { sign_name: 'Stop', category: 'regulatory', meaning: 'Come to a complete stop', action: 'Stop at the line, look right-left-right, proceed when safe', image: 'stop-sign.png' },
        { sign_name: 'Give Way/Yield', category: 'regulatory', meaning: 'Yield to other traffic', action: 'Slow down, prepare to stop, give way to traffic on main road', image: 'give-way.png' },
        { sign_name: 'No Entry', category: 'regulatory', meaning: 'Do not enter this road', action: 'Do not enter, find alternative route', image: 'no-entry.png' },
        { sign_name: 'Speed Limit', category: 'regulatory', meaning: 'Maximum speed allowed', action: 'Do not exceed indicated speed', image: 'speed-limit.png' },
        { sign_name: 'No Overtaking', category: 'regulatory', meaning: 'Overtaking prohibited', action: 'Do not overtake other vehicles', image: 'no-overtaking.png' },
        { sign_name: 'Pedestrian Crossing', category: 'warning', meaning: 'Pedestrian crossing ahead', action: 'Slow down, prepare to stop for pedestrians', image: 'pedestrian-crossing.png' },
        { sign_name: 'Roundabout Ahead', category: 'warning', meaning: 'Roundabout approaching', action: 'Reduce speed, give way to traffic from right', image: 'roundabout.png' }
    ],
    
    // Driving Rules
    drivingRules: [
        { rule: 'Use of Horn', description: 'Use horn only while moving to warn others. No aggressive use or in no-hooting zones.', penalty: 'Fine up to KES 5,000' },
        { rule: 'Emergency Vehicles', description: 'Give way to police, fire engines, ambulances with sirens/flashing lights.', penalty: 'Fine up to KES 10,000' },
        { rule: 'Drunk Driving', description: 'Do not drink and drive. Alcohol slows brain functions and affects judgment.', penalty: 'Fine up to KES 100,000 or imprisonment' },
        { rule: 'Seat Belt Usage', description: 'All passengers must wear seat belts at all times regardless of distance.', penalty: 'Fine up to KES 5,000 per person' },
        { rule: 'Mobile Phones', description: 'No cell phone use while driving. Hands-free only.', penalty: 'Fine up to KES 10,000' },
        { rule: 'Speed Limits', description: 'Drive within designated speed limits. Urban: 50km/h, Highway: 110km/h', penalty: 'Fine up to KES 20,000' },
        { rule: 'Driver Fatigue', description: 'Max 8 hours driving in 24-hour period. Take regular breaks.', penalty: 'Fine up to KES 10,000' }
    ],
    
    // Model Town Features
    modelTownFeatures: [
        { feature: 'One Way Traffic Road', description: 'Road where all vehicles move in one direction (Dual Carriage Way)', rules: 'White continuous line = no changing lanes. White broken line = overtaking allowed if safe. Yellow kerb = no parking or stopping.' },
        { feature: 'Two Way Traffic Road', description: 'Road where vehicles move in opposite directions (Single Carriageway)', rules: 'Yellow continuous line = keep left, no overtaking. Yellow broken line = overtaking allowed if road clear.' },
        { feature: 'Roundabout', description: 'Meeting point where more than two roads meet', rules: 'No stopping, no changing lanes, no parking, no overtaking. Keep left and move clockwise.' },
        { feature: 'Angle Parking', description: 'Controlled parking zone where vehicles park at an angle', rules: 'Strictly for small cars only. Park from farthest end. Park by forward gear. Exit by reverse.' },
        { feature: 'Flush Parking', description: 'Uncontrolled parking zone parallel to the road', rules: 'All vehicle types allowed. Park from farthest end. Park by reverse. Exit by forward driving.' }
    ]
};

// ============================================
// PUSH FUNCTION
// ============================================
async function pushCourseMaterial() {
    console.log('📚 Pushing course material to Supabase...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Push courses
    console.log('📖 Pushing courses...');
    for (const course of courseMaterial.courses) {
        try {
            const { error } = await supabase
                .from('courses')
                .upsert(course, { onConflict: 'id' });
            
            if (error) throw error;
            console.log(`✅ Course ${course.id}: ${course.title}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Course ${course.id}: ${error.message}`);
            errorCount++;
        }
    }
    
    // Push traffic signs (if table exists)
    console.log('\n🚦 Pushing traffic signs...');
    for (const sign of courseMaterial.trafficSigns) {
        try {
            const { error } = await supabase
                .from('traffic_signs')
                .upsert(sign, { onConflict: 'sign_name' });
            
            if (error && error.code !== '42P01') throw error;
            console.log(`✅ ${sign.sign_name}`);
            successCount++;
        } catch (error) {
            if (error.code === '42P01') {
                console.log(`⚠️ Traffic signs table not found, skipping`);
                break;
            }
            console.error(`❌ ${sign.sign_name}: ${error.message}`);
            errorCount++;
        }
    }
    
    // Push driving rules (if table exists)
    console.log('\n📋 Pushing driving rules...');
    for (const rule of courseMaterial.drivingRules) {
        try {
            const { error } = await supabase
                .from('driving_rules')
                .upsert(rule, { onConflict: 'rule' });
            
            if (error && error.code !== '42P01') throw error;
            console.log(`✅ ${rule.rule}`);
            successCount++;
        } catch (error) {
            if (error.code === '42P01') {
                console.log(`⚠️ Driving rules table not found, skipping`);
                break;
            }
            console.error(`❌ ${rule.rule}: ${error.message}`);
            errorCount++;
        }
    }
    
    // Push model town features (if table exists)
    console.log('\n🏘️ Pushing model town features...');
    for (const feature of courseMaterial.modelTownFeatures) {
        try {
            const { error } = await supabase
                .from('model_town_features')
                .upsert(feature, { onConflict: 'feature' });
            
            if (error && error.code !== '42P01') throw error;
            console.log(`✅ ${feature.feature}`);
            successCount++;
        } catch (error) {
            if (error.code === '42P01') {
                console.log(`⚠️ Model town features table not found, skipping`);
                break;
            }
            console.error(`❌ ${feature.feature}: ${error.message}`);
            errorCount++;
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 UPLOAD SUMMARY:`);
    console.log(`   ✅ Success: ${successCount} items`);
    console.log(`   ❌ Errors: ${errorCount} items`);
    console.log('='.repeat(50));
    
    // Verify
    console.log('\n🔍 Verifying courses in database...');
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, type, price')
        .order('id');
    
    if (courses) {
        console.log('\n📚 Courses in Supabase:');
        courses.forEach(c => {
            console.log(`   ${c.id}. ${c.title} - ${c.type === 'free' ? 'FREE' : 'KES ' + c.price.toLocaleString()}`);
        });
    }
    
    console.log('\n🎉 Course material successfully pushed to Supabase!');
}

// Run the push
pushCourseMaterial();
