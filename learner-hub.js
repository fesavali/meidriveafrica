import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://jeksrwrzzrczamxijvwl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla3Nyd3J6enJjemFteGlqdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYyMjAsImV4cCI6MjA5NDI1MjIyMH0.1poYpJKNFEVe2NTBkXBTH2bIHGk2yT8aqCU-OlJc4vs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// UNIT 1: INTRODUCTION TO DRIVING
// ============================================
const unit1 = {
    unit_number: 1,
    title: 'Introduction to Driving',
    description: 'Motor vehicles are an important part of our day-to-day living and provide a means for people and goods to be transported from one location to another.',
    content: `The goal of driver training is ensure that you, as the driver, are equipped with the right knowledge of how to handle your vehicle and how to act appropriately when using the road.

Most traffic accidents are caused by human error, however this can be easily prevented when the driver is adequately prepared for the traffic situation. This training also ensures that you are prepared with the necessary skills to provide safe and efficient transport services for goods and for passengers.`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Beginner',
    key_points: [
        'Motor vehicles transport people and goods',
        'Driver training provides knowledge and skills',
        'Most accidents caused by human error',
        'Proper preparation prevents accidents'
    ]
};

// ============================================
// UNIT 2: FUNDAMENTAL DRIVING RULES
// ============================================
const unit2 = {
    unit_number: 2,
    title: 'Fundamental Driving Rules',
    description: 'The road is governed by rules and regulations that ensure order is maintained on the roads at all times.',
    content: `The Traffic Act sets out the laws that govern the use of roads and the expected conduct of road users. It also includes some of the penalties and fines for road users who do not abide by these laws.

The Highway Code is a set of information, advice, guides and mandatory rules for all road users in Kenya. It provides guidelines for animal, pedestrians, cyclists and motorcyclists.

KEY RULES:
• Use of the horn - only while moving to warn others, not aggressively, not in no-hooting zones
• Give right-of-way to police cars, emergency vehicles (fire engines, ambulances with sirens), presidential motorcade
• Respect pedestrian right of way
• Follow all traffic signs and signals

Traffic signs categories:
• Triangle: Warning
• Circle: Giving an order
• Rectangle: Informing`,
    type: 'free',
    price: 0,
    duration: '3 hours',
    level: 'Beginner',
    key_points: [
        'Traffic Act and Highway Code govern road use',
        'Horn only for warning while moving',
        'Give way to emergency vehicles',
        'Pedestrians have right of way',
        'Three types of traffic signs: Warning, Order, Information'
    ]
};

// ============================================
// UNIT 3: MODEL TOWN
// ============================================
const unit3 = {
    unit_number: 3,
    title: 'Model Town',
    description: 'Understanding road networks through model town board simulation',
    content: `The model town board is an example of a road network on a board. It is a simplified representation used to explain the types of roads found in major towns of Kenya and East Africa.

MODEL TOWN FEATURES:
1. One way traffic road (Dual Carriage Way)
2. Two way traffic road (Single Carriageway)
3. Roundabout
4. Parking zones (Angle and Flush parking)
5. Yellow kerb (no parking/stopping)
6. Pedestrian crossing
7. Stop sign (red octagon)
8. Give way sign (red triangle)
9. Exit from main road
10. Exit from controlled parking zone
11. Road markings (arrows, reflectors, delta marks)

ONE WAY TRAFFIC ROAD:
• White continuous line = no changing lanes or overtaking
• White broken line = overtaking allowed if safe
• Yellow kerb = no parking, waiting, or stopping

TWO WAY TRAFFIC ROAD:
• Yellow continuous line = keep left, no overtaking
• Yellow broken line = overtaking allowed if road clear

ROUNDABOUT RULES:
• No stopping, no changing lanes, no parking, no overtaking, no waiting
• Keep left and move clockwise
• Lanes counted from outermost (1) to innermost (4)

PARKING ZONES:
• Angle Parking: Small cars only, park forward, exit reverse
• Flush Parking: All vehicles except tractors, park reverse, exit forward`,
    type: 'free',
    price: 0,
    duration: '4 hours',
    level: 'Intermediate',
    key_points: [
        'One-way roads: white lines, yellow kerb means no stopping',
        'Two-way roads: yellow lines, keep left',
        'Roundabout: keep left, no overtaking, lanes 1-4',
        'Angle parking: forward in, reverse out',
        'Flush parking: reverse in, forward out'
    ]
};

// ============================================
// UNIT 4: HUMAN FACTORS IN TRAFFIC
// ============================================
const unit4 = {
    unit_number: 4,
    title: 'Human Factors in Traffic',
    description: 'Understanding how human behavior affects road safety',
    content: `OBSERVATION RULES:
• Keep your eyes moving - don't focus on one angle
• Get a wide view of what's ahead and behind
• Use all mirrors (rear view and wide view)
• Ensure other road users can see you
• Watch for cyclists, motorcyclists and pedestrians
• Give special attention to vulnerable road users (children, elderly, disabled)

HEALTH AND SAFETY:
• Eyesight: Check regularly, wear prescribed spectacles
• Fatigue: Extreme tiredness from mental/physical exertion
• Get quality sleep before driving
• Take regular breaks on long distances

DISTRACTIONS TO AVOID:
• Handheld devices (cell phones) - illegal while driving
• Adjusting radio/volume while driving
• Grooming, smoking, eating while driving
• Video devices in driver's view

ALCOHOL, DRUGS AND MEDICINE:
• Effects: Slows brain functions, reduces judgment, false confidence, affects balance
• Police breathalyser (ALCOBLOW) measures Blood Alcohol Concentration
• Do not drink and drive - designate a non-drinking driver

SAFETY BELTS:
• All passengers must wear safety belts at all times
• Child restraints/booster seats for children under 12

SAFETY EQUIPMENT:
• Reflector Triangle - place 60m ahead and behind disabled vehicle
• First Aid Kit - gauze, bandages, scissors, gloves, antiseptic
• Tool Box - jack and spanner for repairs
• Fire Extinguisher - inspect regularly
• Tow ropes - for towing broken down vehicles
• Spare tyre - keep inflated
• Jumpstart cables - to reignite engine`,
    type: 'free',
    price: 0,
    duration: '3 hours',
    level: 'Beginner',
    key_points: [
        'Keep eyes moving, use all mirrors',
        'Fatigue: get quality sleep before driving',
        'No cell phones while driving',
        'Alcohol slows brain function - don't drink and drive',
        'Safety belts mandatory for all passengers',
        'Carry reflector triangle, first aid kit, fire extinguisher'
    ]
};

// ============================================
// UNIT 5: VEHICLE CONSTRUCTIONS AND CONTROLS
// ============================================
const unit5 = {
    unit_number: 5,
    title: 'Vehicle Constructions and Controls',
    description: 'Learning about vehicle components and their functions',
    content: `CONTROLS AND THEIR FUNCTIONS:

Steering Wheel - Used to change direction or maintain course. Both hands on steering wheel at all times.

Direction Indicator - Signals turning left or right.

Gear Lever - Used to change gears in manual vehicle.

Hand Brake - Keeps vehicle stationary, especially on inclines.

Brake Pedal - Used to slow speed or stop.

Accelerator - Used to increase speed.

Clutch Pedal - Used to change gears in manual vehicle.

Rear-view Mirror - See vehicles and hazards behind.

Side Mirror - See vehicles behind and to the side.

Windscreen Wipers - Clear view while driving in rain.

Speedometer - Shows driving speed.

Temperature Gauge - Checks engine temperature.

VEHICLE SYSTEMS:
• Engine - Power source
• Braking system - Disc brakes, drum brakes, handbrakes
• Steering system - Controls direction
• Transmission system - Transfers power to wheels
• Suspension system - Absorbs road shocks
• Rim and Tyres - Contact with road surface
• Lights and Reflectors - Visibility and communication`,
    type: 'premium',
    price: 5000,
    duration: '5 hours',
    level: 'Beginner',
    key_points: [
        'Steering wheel: both hands at 10-and-2 or 9-and-3',
        'Gear lever: 5 forward gears, 1 reverse',
        'Brake pedal slows/stops, accelerator increases speed',
        'Clutch pedal only for manual transmission',
        'Mirrors: rear-view and side mirrors for visibility'
    ]
};

// ============================================
// UNIT 6: SELF-INSPECTION OF VEHICLE
// ============================================
const unit6 = {
    unit_number: 6,
    title: 'Self-Inspection of Vehicle',
    description: 'Pre-journey vehicle inspection checklist',
    content: `EXTERIOR INSPECTION:
1. Tyres - Check pressure, tread depth, condition, secure fastening
2. Reflectors and lights - Headlights, turn signals, hazard lights
3. Mirrors - Present, properly adjusted, unobstructed
4. Windshield Wipers - Work at all settings, have wiper fluid
5. Windows - Open and shut without difficulty
6. The Body - Check for dents and scratches
7. Cleanliness - Windscreen, windows, mirrors clean
8. Safety Belts - Functional clasps, clean
9. Emergency equipment - Reflector triangle, fire extinguisher, first aid kit, tools, spare tyre
10. Paperwork - License, registration, insurance

INTERIOR INSPECTION:
1. Brakes - Properly adjusted
2. Steering - Full 360° range of motion
3. Indicators - Operational
4. Transmission - Capable of shifting into any gear
5. Oil level - Check and top up if needed
6. Coolant - Check level
7. Battery - Check connections
8. Leaks - Check for any fluid leaks

TYRE SAFETY CHECK:
• Visual inspection before/after every journey
• Remove small stones from tread
• Replace aging tyres
• Check tyre pressure (underinflated and overinflated are both harmful)
• Ensure spare tyre is in good condition`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Beginner',
    key_points: [
        'Check tyres, lights, mirrors before every journey',
        'Ensure all emergency equipment is present',
        'Verify paperwork (license, registration, insurance)',
        'Check brakes, steering, indicators',
        'Inspect oil, coolant, battery for leaks'
    ]
};

// ============================================
// UNIT 7: OBSERVATION
// ============================================
const unit7 = {
    unit_number: 7,
    title: 'Observation',
    description: 'Mastering observation techniques for safe driving',
    content: `Driver visibility is the maximum distance at which a driver can clearly identify objects around the car.

MIRROR TYPES:
1. Rear View Mirror (Interior mirror) - Flat glass, no distortion, judge speed/distance
2. Exterior Mirrors - Convex glass, wider field of vision

BLIND SPOT: The area around the vehicle that the driver cannot directly observe.

Check blind spot before:
• Changing direction when motorcyclists/cyclists are close
• Overtaking on dual carriageway
• Changing lanes
• When potential hazard may be obscured

To enhance driver visibility:
• Check interior mirror first, then door mirror
• Look for potential hazards (vehicles behind, approaching quickly, motorcyclists, cyclists)
• A vehicle too close behind: slow earlier to give more reaction time
• Vehicle approaching quickly: slow slightly later to give greater stopping distance`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Intermediate',
    key_points: [
        'Driver visibility = maximum distance to identify objects',
        'Rear view mirror: flat glass, no distortion',
        'Exterior mirrors: convex, wider view but distance harder to judge',
        'Blind spot: area driver cannot directly observe',
        'Check blind spot before changing lanes or overtaking'
    ]
};

// ============================================
// UNIT 8: VEHICLE CONTROL
// ============================================
const unit8 = {
    unit_number: 8,
    title: 'Vehicle Control',
    description: 'Practical vehicle control techniques',
    content: `DRIVING PREPARATION:
• Adjust driving seat for comfort
• Adjust mirrors
• Check doors shut properly
• Fasten seat belt (all passengers)
• Sit correctly - back supported, feet reach pedals
• Hold steering wheel correctly (10-to-2 or 9-and-3 position)
• Check dashboard instruments

TO START THE VEHICLE:
1. Depress clutch pedal fully (wait 3 seconds)
2. Put hand brake ON
3. Turn ignition ON, then motor ON
4. Start motor by turning key, release when engine starts
5. Step lightly on accelerator to warm engine
6. Check rear view mirrors
7. Give proper signal
8. Select appropriate gear
9. Increase engine speed
10. Move handbrake OFF
11. Let clutch rise until engine speed decreases

TO STOP THE VEHICLE:
1. Check mirrors (safe to stop)
2. Signal properly
3. Remove foot from accelerator
4. Apply foot brake pressure
5. Depress clutch as car comes to rest
6. Set hand brake ON
7. Put gear in 1st position
8. Switch off engine

GEAR SPEEDS:
• 1st Gear: 0-30 km/h (moving off from stationary)
• 2nd Gear: Slow moving traffic, downhill
• 3rd Gear: 35-70 km/h
• 4th Gear: 60-110 km/h (overtaking)
• 5th Gear: 80-110 km/h (highways)

PARKING TYPES:
• Angle Parking: Forward in, reverse out (small cars only)
• Flush Parking: Reverse in, forward out (all vehicles)
• Parallel Parking: Parallel to kerb

TURNS:
• J-turn: Reversing vehicle turns 180° forward
• U-turn: Forward vehicle turns 180° opposite direction`,
    type: 'premium',
    price: 7500,
    duration: '6 hours',
    level: 'Intermediate',
    key_points: [
        'Adjust seat and mirrors before driving',
        'Always fasten seat belt',
        'MSM: Mirror, Signal, Manoeuvre',
        '1st gear: 0-30 km/h, 5th gear: 80-110 km/h',
        'Angle parking: forward in, reverse out',
        'J-turn: reverse to forward 180°, U-turn: forward to opposite'
    ]
};

// ============================================
// UNIT 9: COMMUNICATION ON THE ROAD
// ============================================
const unit9 = {
    unit_number: 9,
    title: 'Communication on the Road',
    description: 'Effective communication with other road users',
    content: `MSM TECHNIQUE (Mirror, Signal, Manoeuvre):

MIRROR:
• Check interior mirror, then door mirror
• Look for potential hazards (vehicles behind, approaching quickly, motorcyclists, cyclists)
• Check blind spot if needed

SIGNAL:
• Apply signal to direction intended
• Signal in good time (not too late, not too early)
• If hazard is present, may need to alter route

MANOEUVRE:
• Apply to roundabouts, junctions, changing lanes, parking
• Be prepared to alter MSM routine based on circumstances

TRAFFIC LIGHT SIGNALS:
• RED: STOP
• RED + AMBER: STOP, get ready
• GREEN: Go if road clear
• AMBER: STOP at the line

HAND SIGNALS BY DRIVERS:
• Left turn: Arm out, rotating forward
• Right turn: Arm out straight
• Slowing down: Arm out, moving up and down

TRAFFIC POLICE SIGNALS:
• STOP traffic from behind: Arm raised with palm facing back
• STOP traffic from both directions: Both arms raised
• Come on: Arm motioning forward

If traffic signals fail (blackout):
• Stop at intersection
• Proceed when you know other vehicles have stopped`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Intermediate',
    key_points: [
        'MSM: Mirror, Signal, Manoeuvre',
        'Check interior mirror first, then door mirror',
        'Signal in good time, not too early or late',
        'Red: STOP, Green: Go if clear, Amber: STOP',
        'Hand signals for turning and slowing'
    ]
};

// ============================================
// UNIT 10: SPEED MANAGEMENT
// ============================================
const unit10 = {
    unit_number: 10,
    title: 'Speed Management',
    description: 'Managing speed for safe driving',
    content: `THE 4 SECOND RULE:
• Guideline for minimum following distance in adverse weather
• When vehicle ahead passes landmark, count "one thousand and one, one thousand and two, one thousand and three, one thousand and four"
• If you pass landmark before finishing, you're too close

BRAKING DISTANCE:
• Distance from hitting brakes to complete stop
• Increases on wet/icy roads
• Increases with higher speed
• Increases if vehicle poorly maintained (worn tyres, poor brakes, overloaded)

THINKING DISTANCE:
• Distance from deciding to brake to actually braking
• Affected by speed, fatigue, distractions

STOPPING DISTANCE = Thinking Distance + Braking Distance

FREE WHEELING (COASTING):
• Moving vehicle without using power (depressing clutch or neutral gear)
• RISKS: Reduces control, prevents acceleration, increases brake wear, doesn't save fuel

PROGRESSIVE BRAKING:
• Safer than freewheeling
• Reduces wear on brakes and tyres
• Maintains driver control`,
    type: 'premium',
    price: 5000,
    duration: '3 hours',
    level: 'Advanced',
    key_points: [
        '4 Second Rule for following distance in bad weather',
        'Stopping distance = thinking distance + braking distance',
        'Braking distance increases on wet roads and with higher speed',
        'Freewheeling reduces control and doesn't save fuel',
        'Progressive braking is safer than freewheeling'
    ]
};

// ============================================
// UNIT 11: SPACE MANAGEMENT
// ============================================
const unit11 = {
    unit_number: 11,
    title: 'Space Management',
    description: 'Managing space around your vehicle',
    content: `ROAD CONDITIONS:
1. Open Condition - Clear broad view, easy to adjust speed and change lanes
2. Closed Conditions - Limited space, restricted view (trees, buildings, vehicles)
3. Changing Conditions - Speed limit changes, road surface changes, weather affects visibility

TO MANAGE SPACE:
• Drive at same speed as surrounding vehicles
• Maintain safe following distance (4 Second Rule)
• Keep appropriate space envelope around vehicle

SPACE RECOVERY (when insufficient space in front):
• Signal to indicate intention to slow down
• Turn slowly to create more space
• Be aware of size/weight of oncoming vehicles
• Don't reverse (affects vehicles behind)

POSITION TO 'SEE AND BE SEEN':
• Position vehicle to have clear view
• Ensure other drivers can see you`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Intermediate',
    key_points: [
        'Open: clear view, Closed: restricted, Changing: variable conditions',
        'Maintain safe following distance',
        'Signal before slowing down for space recovery',
        'Position to see and be seen'
    ]
};

// ============================================
// UNIT 12: EMERGENCY MANOEUVRES
// ============================================
const unit12 = {
    unit_number: 12,
    title: 'Emergency Manoeuvres',
    description: 'Handling emergency situations on the road',
    content: `EVASIVE TURNS:
• J-turns and U-turns (covered in Unit 8)

BRAKE FAILURE:
• Pump brake pedal to restore hydraulic pressure
• If fails, apply parking brake (hand brake) gently but firmly while holding release button
• If total brake failure, don't drive again - call mechanic

BLOWOUTS:
• Keep firm grip on steering wheel
• DON'T slam on brakes
• Let car slow down gradually
• Pull to side when slowed to safe speed
• Activate hazard lights

WHEEL GOES OFF PAVEMENT:
• Hold steering firmly
• Take foot off accelerator to slow down (avoid heavy braking)
• When under control, steer towards pavement

HEADLIGHTS FAIL:
• Check switch immediately
• If lights remain off, keep left, stop safely off road
• Illegal to drive at night without lights

DEFENSIVE DRIVING:
• Safe/cautious driving in potentially dangerous environments
• Go beyond basic rules and mechanical skills
• Prepares you for adverse conditions
• Improves observation, anticipation, awareness`,
    type: 'premium',
    price: 5000,
    duration: '3 hours',
    level: 'Advanced',
    key_points: [
        'Brake failure: pump brakes, then use hand brake',
        'Blowout: firm grip, no sudden braking, slow gradually',
        'Wheel off pavement: hold firm, no heavy braking',
        'Defensive driving: anticipate hazards, stay vigilant'
    ]
};

// ============================================
// UNIT 13: SKID CONTROL AND RECOVERY
// ============================================
const unit13 = {
    unit_number: 13,
    title: 'Skid Control and Recovery',
    description: 'Managing and recovering from vehicle skids',
    content: `CAUSES OF SKIDS:
• Driving faster than road/traffic conditions allow
• Sudden, hard braking
• Turning too fast or accelerating too quickly

TYPES OF SKIDDING:
• Front Wheel Skid - Vehicle goes off intended course (excess speed on corner entry, sudden braking)
• Rear Wheel Skid - Rear swings out as if overtaking front (excessive speed leading to sudden braking)
• Aquaplaning - Tyres lose contact on wet roads (tyre tread can't channel water away)

AQUAPLANING PREVENTION:
• Reduce speed in wet conditions
• Ensure correct tyre pressure
• Maintain proper tyre tread depth

SKID RECOVERY:
1. Take feet off accelerator pedals
2. Release brake pedal and reapply brakes gently
3. Quickly turn steering wheel in direction you want to go
4. As vehicle turns back, steer opposite to stay on desired path
5. Continue looking at your path of travel`,
    type: 'premium',
    price: 5000,
    duration: '2 hours',
    level: 'Advanced',
    key_points: [
        'Skids from: excess speed, hard braking, turning too fast',
        'Front skid: off course, Rear skid: rear swings out',
        'Aquaplaning: tyres lose contact on wet roads',
        'Recovery: off accelerator, gentle brakes, steer into skid'
    ]
};

// ============================================
// UNIT 14: ADVERSE DRIVING CONDITIONS
// ============================================
const unit14 = {
    unit_number: 14,
    title: 'Adverse Driving Conditions',
    description: 'Driving safely in difficult weather and road conditions',
    content: `NIGHT DRIVING:
• Slow down, especially on unlit roads
• Don't over-drive headlights (stopping distance > headlight range)
• When meeting oncoming bright lights: look up and left
• Use low beams within 150m of oncoming vehicle or following within 60m

FOG:
• Slow down gradually
• Use low beam headlights (high beams reflect off moisture)
• Use fog lights if available
• Don't overtake, change lanes, or cross traffic
• If visibility decreasing rapidly, move off road to safe area

RAIN:
• Rain makes road slippery and reduces visibility
• Ensure wiper blades in good condition
• Smooth steering, braking, accelerating reduces skid chance
• Leave more space between vehicles
• Stay out of puddles (may hide potholes, drown engine)

REDUCED TRACTION:
• Most dangerous during first 10 minutes of heavy downpour (oil and debris rise)
• Use second gear to prevent wheel spin
• Rock way out: forward until stops, reverse back, repeat

EMERGENCY STEERING METHODS:
• Push-pull method: hands shuffle, no crossing 12-6 line
• Fixed-hand method: rapid 180° steering

ANTI-LOCK BRAKING SYSTEMS (ABS):
• Use "plant and steer" method
• Don't remove foot from brake or pump pedal
• Hold brake pedal down and steer

THRESHOLD BRAKING (without ABS):
• Keep heel on floor, use ball of foot
• Apply firm, steady pressure to threshold of locking brakes`,
    type: 'premium',
    price: 7500,
    duration: '4 hours',
    level: 'Advanced',
    key_points: [
        'Night: slow down, don\'t over-drive headlights',
        'Fog: low beams, fog lights, pull off if needed',
        'Rain: smooth inputs, increase following distance',
        'ABS: plant and steer, don\'t pump brakes',
        'Threshold braking: steady pressure without locking'
    ]
};

// ============================================
// UNIT 15: PREVENTIVE MAINTENANCE
// ============================================
const unit15 = {
    unit_number: 15,
    title: 'Preventive Maintenance',
    description: 'Regular vehicle maintenance and troubleshooting',
    content: `PREVENTIVE MAINTENANCE INCLUDES:
• Vehicle inspection
• Lubrication
• Adjustment
• Cleaning
• Testing of certain parts
• Repair and replacement of worn parts

COMMON ISSUES AND SOLUTIONS:

Tyres/Steering:
• Puncture → Change wheel
• Heavy steering → Power assisted steering fault → Seek assistance
• Vibrations → Bulge in tyre or wheel out of balance → Change tyre or seek assistance

Brakes:
• Vehicle pulls to one side when braking → Incorrect adjustment or undue wear → Seek assistance
• Warning light shows → Low brake fluid → Check level

Lights:
• Lamp doesn't light → Bulb failure → Check and replace bulb
• Indicator flashing irregularly → Fuse failure → Check and replace fuse

Engine:
• Misfiring or won't run → Fuel or electrical fault → Examine connections
• Fails to start → Out of fuel → Refuel, Battery flat → Jump start
• Overheating → Loss of coolant → Check gauge, tape hose for temporary repair`,
    type: 'free',
    price: 0,
    duration: '3 hours',
    level: 'Intermediate',
    key_points: [
        'PM includes inspection, lubrication, cleaning, testing, repair',
        'Tyres: puncture → change wheel',
        'Brakes: pulls to side → seek assistance',
        'Lights: bulb failure → check and replace',
        'Engine: won't start → check fuel, battery'
    ]
};

// ============================================
// UNIT 16: CONDITIONS OF CARRIAGE
// ============================================
const unit16 = {
    unit_number: 16,
    title: 'Conditions of Carriage',
    description: 'Legal requirements for transporting goods and passengers',
    content: `Conditions of carriage refer to customers' rights and restrictions, and driver's obligations.

COMMERCIAL VEHICLE: Motor vehicle constructed or adapted for carriage of goods or burdens in connection with trade, business, or agriculture.

PSV (Public Service Vehicle) REQUIREMENTS:
• Provide statement of liability
• State fares/ticketing prices
• Indicate exceptions with fare prices
• Abide by code of conduct customers can rely on
• Address restricted items
• Lost property procedures
• Provide contact details

LOAD LIMITS FOR CATEGORY B:
• Maximum passengers: Not more than seven
• Maximum load: Gross Vehicle Weight up to 3,500kg with trailer not exceeding 750kg

LOADING GUIDELINES:
• Items as low as possible, close to centre of vehicle
• Don't put items on roof without designated luggage compartment
• Don't overload
• Check tyre pressure for weight being carried`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Intermediate',
    key_points: [
        'Conditions of carriage = customer rights and driver obligations',
        'PSV: statement of liability, fare pricing, code of conduct',
        'Category B: max 7 passengers, GVW up to 3,500kg',
        'Load items low and centered, don\'t overload'
    ]
};

// ============================================
// UNIT 17: HAZARDOUS MATERIALS
// ============================================
const unit17 = {
    unit_number: 17,
    title: 'Hazardous Materials',
    description: 'Safe handling and transport of dangerous goods',
    content: `Hazardous Material is any material prescribed by law including explosives, petroleum products, and any material involving high risk.

CHARACTERISTICS OF HAZARDOUS GOODS:
• Flammable - can burn easily
• Corrosive - rusts or decomposes
• Reactive - can explode
• Toxic - poisonous

9 CLASSES OF HAZARDOUS MATERIALS:
1. Explosives
2. Gases
3. Flammable Liquids
4. Flammable Solids
5. Oxidizing Substances
6. Toxic & Infectious Substances
7. Radioactive Material
8. Corrosives
9. Miscellaneous Dangerous Goods

REQUIREMENTS:
• Driver must get legal approval before handling hazardous material
• Special equipment and vehicle alterations may be required
• Hazmat Endorsement Framework for assessment process
• Kenya Bureau of Standards (KBS), NEMA, and NTSA coordinate licencing

DO NOT handle hazardous material without appropriate licensing`,
    type: 'premium',
    price: 10000,
    duration: '4 hours',
    level: 'Advanced',
    key_points: [
        'Hazardous: flammable, corrosive, reactive, toxic',
        '9 classes from Explosives to Miscellaneous',
        'Need legal approval and special equipment',
        'Licenced by KBS, NEMA, and NTSA'
    ]
};

// ============================================
// UNIT 18: EMERGENCY PROCEDURES
// ============================================
const unit18 = {
    unit_number: 18,
    title: 'Emergency Procedures',
    description: 'What to do in case of road accidents and emergencies',
    content: `STEPS AT CRASH SCENE:
1. Set up reflector triangles 50 metres behind and ahead of vehicle
2. Call emergency services (police, ambulance, fire brigade)
3. Move uninjured people away from vehicles to safety
4. DO NOT move injured unless immediate danger (fire/explosion)
5. Don't remove motorcyclist's helmet unless essential
6. Be prepared to give First Aid
7. Stay at scene until police arrive

FIRST AID - Dr. A.B.C.:
• D = Danger: Is there continuing danger? Make safe.
• R = Response: Shake gently, talk. Check for response.
• A = Airway: Is throat clear? Tilt head, clear mouth.
• B = Breathing: Check for breath for 10 seconds. If not, give artificial respiration.
• C = Circulation: Check pulse. If no pulse, apply CPR.

RECOVERY POSITION:
• Stable position on side to prevent choking
• Head tilted back, lower arm out at right angle
• Upper arm hand under cheek

BLEEDING TREATMENT:
• Apply firm pressure over wound
• Use sterile dressing or clean padding
• Raise bleeding limb if no broken bones

SHOCK TREATMENT:
• Lay person down
• Loosen tight clothing
• Keep warm with blanket
• Talk to keep calm
• Raise legs slightly

REPORTING ACCIDENT:
• Report to police as soon as possible
• Report to employer (if hired driver)
• Take photo or sketch scene if safe
• Record number plates of vehicles involved`,
    type: 'free',
    price: 0,
    duration: '3 hours',
    level: 'Intermediate',
    key_points: [
        'Reflector triangles 50m behind and ahead',
        'Dr. A.B.C: Danger, Response, Airway, Breathing, Circulation',
        'Recovery position: on side, head tilted',
        'Apply firm pressure to bleeding wounds',
        'Report accident to police immediately'
    ]
};

// ============================================
// UNIT 19: WORK PLANNING
// ============================================
const unit19 = {
    unit_number: 19,
    title: 'Work Planning',
    description: 'Trip planning and time management for drivers',
    content: `PREPARING FOR JOURNEY (TRIP PLANNING):
• Name, address, phone, directions of sender
• Pick-up phone number
• Appointment time for collecting and delivering goods
• Requirements for securing load (e.g., fragile)
• Legal requirements for Hazardous Material or cross-border transport

MANAGING THE TRIP - FACTORS AFFECTING:
• Distance to be travelled (may need co-driver for long distances)
• Time/Traffic conditions (peak hours, night/early morning driving)
• Meals (plan ahead, use familiar places)
• Fatigue (don't start journey tired, take breaks)
• Adverse weather conditions (avoid if possible, take precautions)

LEGAL LIMITS (Traffic Act 66A):
• No person shall drive a public service vehicle or commercial vehicle for more than total of eight hours in any period of twenty-four hours

COMPLETING RECORDS:
• After completing journey, provide summarized record of trip
• Work tickets or trip cards`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Beginner',
    key_points: [
        'Plan: contact info, appointment time, load requirements',
        'Consider distance, traffic, meals, fatigue, weather',
        'Legal limit: max 8 hours driving in 24-hour period',
        'Complete trip records after journey'
    ]
};

// ============================================
// UNIT 20: CUSTOMER CARE
// ============================================
const unit20 = {
    unit_number: 20,
    title: 'Customer Care',
    description: 'Professional conduct and customer service for drivers',
    content: `ESSENTIAL SKILLS:
• Communication skills
• Handling customer expectations
• Handling customers with special needs
• Knowledge of sexual harassment and other forms of discrimination

COURTESY ON THE ROAD:
• Get proper training and license before driving
• Apply road safety techniques
• Have positive attitude
• Take responsibility for actions
• Be visible (correct positioning, signalling)
• Keep vehicle and number plates clean

BEFORE TRIP:
• Pick/drop off at appropriate points
• Provide sufficient time for boarding/alighting
• Assist passengers who need help
• Address customers respectfully
• Be professional (clear information about service, charges)
• Provide helmet and reflective jacket for passengers

PERSONAL HYGIENE:
• Be smart, sober, clean
• Provide clean environment for passengers
• Keep vehicle clean
• Keep safety gear clean

SEXUAL HARASSMENT:
• Unwelcome requests for sexual contact or activity
• Spoken/written language of sexual nature
• Physical behaviour of sexual nature

DISCRIMINATION:
• Treating customers favourably/unfavourably based on appearance, race, ethnicity, gender, age

RESPONSE:
• Speak up, address issue with administrative authority
• Seek assistance from police

DEFENSIVE RIDING:
• Improve observation, anticipation, awareness
• Apply sound judgement of speed and distance
• Don't drive when tired, rest before journey`,
    type: 'free',
    price: 0,
    duration: '2 hours',
    level: 'Beginner',
    key_points: [
        'Essential: communication, handling expectations, special needs',
        'Be courteous, visible, responsible',
        'Keep vehicle and self clean',
        'Sexual harassment and discrimination are illegal',
        'Report incidents to authority or police'
    ]
};

// ============================================
// UNIT 21: EXAMINATION FOR DRIVERS - 1000 QUIZ BANK
// ============================================
const unit21 = {
    unit_number: 21,
    title: 'The Examination - 1000 Quiz Bank',
    description: 'Comprehensive exam preparation with 1000 practice questions',
    content: `To get your driving licence, follow the exam registration procedure provided by NTSA.

PREPARATION:
• Prepare adequately for both practical and theory exam
• Study all 20 previous units
• Review traffic signs and model town illustrations
• Practice with quiz bank questions

ON EXAM DAY:
• Go to examination centre on time
• Avoid arriving late
• Bring required documents

EXAM COVERS:
• All 20 units from Introduction to Customer Care
• Traffic signs (regulatory, warning, information, guidance)
• Model town illustrations and rules
• Highway Code and Traffic Act regulations

QUIZ BANK FEATURES:
• 1000+ practice questions
• Multiple choice format
• Covers all exam topics
• Answers with explanations`,
    type: 'premium',
    price: 2000,
    duration: '10 hours',
    level: 'Advanced',
    key_points: [
        'Follow NTSA registration procedure',
        'Prepare for practical and theory exams',
        'Study all 20 units and traffic signs',
        'Arrive on time at examination centre',
        '1000+ practice questions available'
    ]
};

// ============================================
// All units array
// ============================================
const allUnits = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, unit9, unit10, unit11, unit12, unit13, unit14, unit15, unit16, unit17, unit18, unit19, unit20, unit21];

// ============================================
// Push to Supabase
// ============================================
async function pushLearnerHub() {
    console.log('📚 Pushing LEARNER Hub to Supabase...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const unit of allUnits) {
        try {
            const { data, error } = await supabase
                .from('courses')
                .upsert({
                    unit_number: unit.unit_number,
                    title: unit.title,
                    description: unit.description,
                    content: unit.content,
                    type: unit.type,
                    price: unit.price,
                    duration: unit.duration,
                    level: unit.level
                }, { onConflict: 'unit_number' });
            
            if (error) throw error;
            
            console.log(`✅ Unit ${unit.unit_number}: ${unit.title}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Unit ${unit.unit_number}: ${error.message}`);
            errorCount++;
        }
    }
    
    console.log(`\n🎉 Complete! ${successCount} units pushed, ${errorCount} errors`);
}

// Run the function
pushLearnerHub();
