(function (root) {
  const FOODS = [
    { id: "grilled-chicken", name: "Grilled chicken", aliases: ["chicken breast", "chicken"], kcal: 231, protein: 43, carbs: 0, fat: 5, grams: 140, serving: "1 breast", tags: ["brown", "protein"] },
    { id: "salmon", name: "Baked salmon", aliases: ["fish"], kcal: 280, protein: 30, carbs: 0, fat: 18, grams: 150, serving: "1 fillet", tags: ["orange", "protein"] },
    { id: "eggs", name: "Scrambled eggs", aliases: ["egg"], kcal: 180, protein: 13, carbs: 2, fat: 13, grams: 120, serving: "2 eggs", tags: ["yellow", "protein"] },
    { id: "steak", name: "Steak", aliases: ["beef"], kcal: 320, protein: 32, carbs: 0, fat: 21, grams: 140, serving: "5 oz", tags: ["brown", "dark", "protein"] },
    { id: "tofu", name: "Tofu stir-fry", aliases: ["tofu"], kcal: 210, protein: 18, carbs: 10, fat: 12, grams: 180, serving: "1 bowl", tags: ["white", "green"] },
    { id: "turkey", name: "Turkey slices", aliases: [], kcal: 160, protein: 28, carbs: 1, fat: 4, grams: 100, serving: "3 oz", tags: ["white", "protein"] },
    { id: "rice", name: "White rice", aliases: ["rice bowl"], kcal: 206, protein: 4, carbs: 45, fat: 0, grams: 158, serving: "1 cup", tags: ["white", "carb"] },
    { id: "brown-rice", name: "Brown rice", aliases: [], kcal: 218, protein: 5, carbs: 45, fat: 2, grams: 160, serving: "1 cup", tags: ["brown", "carb"] },
    { id: "pasta", name: "Pasta", aliases: ["spaghetti", "noodles"], kcal: 280, protein: 10, carbs: 54, fat: 2, grams: 180, serving: "1 plate", tags: ["yellow", "white", "carb"] },
    { id: "bread", name: "Toast", aliases: ["bread", "sandwich"], kcal: 150, protein: 5, carbs: 28, fat: 2, grams: 60, serving: "2 slices", tags: ["brown", "carb"] },
    { id: "oatmeal", name: "Oatmeal", aliases: ["oats"], kcal: 166, protein: 6, carbs: 28, fat: 4, grams: 150, serving: "1 bowl", tags: ["brown", "white"] },
    { id: "quinoa", name: "Quinoa bowl", aliases: [], kcal: 222, protein: 8, carbs: 39, fat: 4, grams: 185, serving: "1 cup", tags: ["brown", "white"] },
    { id: "sweet-potato", name: "Sweet potato", aliases: [], kcal: 180, protein: 4, carbs: 41, fat: 0, grams: 200, serving: "1 medium", tags: ["orange"] },
    { id: "broccoli", name: "Steamed broccoli", aliases: ["greens"], kcal: 55, protein: 4, carbs: 11, fat: 1, grams: 150, serving: "1 cup", tags: ["green"] },
    { id: "salad", name: "Garden salad", aliases: ["lettuce", "greens"], kcal: 90, protein: 3, carbs: 12, fat: 4, grams: 180, serving: "1 bowl", tags: ["green"] },
    { id: "avocado", name: "Avocado", aliases: [], kcal: 160, protein: 2, carbs: 9, fat: 15, grams: 100, serving: "1/2 fruit", tags: ["green"] },
    { id: "broccoli-chicken", name: "Chicken and broccoli", aliases: ["chicken broccoli"], kcal: 340, protein: 38, carbs: 14, fat: 14, grams: 320, serving: "1 plate", tags: ["green", "brown"] },
    { id: "stir-fry", name: "Veggie stir-fry", aliases: [], kcal: 240, protein: 8, carbs: 28, fat: 10, grams: 260, serving: "1 plate", tags: ["green", "orange"] },
    { id: "burger", name: "Cheeseburger", aliases: ["burger"], kcal: 540, protein: 28, carbs: 40, fat: 30, grams: 220, serving: "1 burger", tags: ["brown", "red"] },
    { id: "pizza", name: "Pizza slice", aliases: ["pizza"], kcal: 285, protein: 12, carbs: 36, fat: 10, grams: 110, serving: "1 slice", tags: ["red", "yellow", "brown"] },
    { id: "taco", name: "Chicken tacos", aliases: ["taco"], kcal: 310, protein: 22, carbs: 26, fat: 13, grams: 180, serving: "2 tacos", tags: ["brown", "green"] },
    { id: "burrito", name: "Burrito bowl", aliases: ["chipotle", "bowl"], kcal: 620, protein: 32, carbs: 70, fat: 22, grams: 450, serving: "1 bowl", tags: ["brown", "green", "white"] },
    { id: "sushi", name: "Sushi rolls", aliases: ["sushi"], kcal: 350, protein: 16, carbs: 52, fat: 8, grams: 200, serving: "8 pieces", tags: ["white", "orange"] },
    { id: "ramen", name: "Ramen", aliases: [], kcal: 430, protein: 14, carbs: 62, fat: 14, grams: 400, serving: "1 bowl", tags: ["brown", "orange"] },
    { id: "soup", name: "Vegetable soup", aliases: ["soup"], kcal: 140, protein: 5, carbs: 20, fat: 4, grams: 300, serving: "1 bowl", tags: ["orange", "green"] },
    { id: "yogurt", name: "Greek yogurt", aliases: ["yogurt"], kcal: 130, protein: 16, carbs: 8, fat: 4, grams: 170, serving: "1 cup", tags: ["white"] },
    { id: "banana", name: "Banana", aliases: [], kcal: 105, protein: 1, carbs: 27, fat: 0, grams: 118, serving: "1 fruit", tags: ["yellow"] },
    { id: "apple", name: "Apple", aliases: [], kcal: 95, protein: 0, carbs: 25, fat: 0, grams: 180, serving: "1 fruit", tags: ["red", "green"] },
    { id: "berries", name: "Mixed berries", aliases: ["strawberry", "blueberry"], kcal: 70, protein: 1, carbs: 17, fat: 0, grams: 140, serving: "1 cup", tags: ["red"] },
    { id: "latte", name: "Cafe latte", aliases: ["coffee", "latte"], kcal: 150, protein: 8, carbs: 14, fat: 6, grams: 240, serving: "12 oz", tags: ["white", "brown"] },
    { id: "smoothie", name: "Green smoothie", aliases: [], kcal: 220, protein: 6, carbs: 38, fat: 5, grams: 350, serving: "1 cup", tags: ["green"] },
    { id: "fries", name: "French fries", aliases: ["fries"], kcal: 365, protein: 4, carbs: 48, fat: 17, grams: 120, serving: "medium", tags: ["yellow", "brown"] },
    { id: "pad-thai", name: "Pad Thai", aliases: [], kcal: 490, protein: 18, carbs: 62, fat: 18, grams: 320, serving: "1 plate", tags: ["orange", "brown"] },
    { id: "curry", name: "Chicken curry + rice", aliases: ["curry"], kcal: 520, protein: 28, carbs: 58, fat: 18, grams: 400, serving: "1 plate", tags: ["orange", "yellow", "white"] },
    { id: "poke", name: "Poke bowl", aliases: [], kcal: 480, protein: 30, carbs: 52, fat: 16, grams: 380, serving: "1 bowl", tags: ["orange", "white", "green"] },
    { id: "bagel", name: "Bagel with cream cheese", aliases: ["bagel"], kcal: 360, protein: 11, carbs: 52, fat: 12, grams: 140, serving: "1 bagel", tags: ["brown", "white"] },
    { id: "pancake", name: "Pancakes", aliases: [], kcal: 350, protein: 8, carbs: 58, fat: 10, grams: 160, serving: "2 pancakes", tags: ["yellow", "brown"] },
    { id: "cereal", name: "Cereal and milk", aliases: ["cereal"], kcal: 240, protein: 8, carbs: 42, fat: 5, grams: 250, serving: "1 bowl", tags: ["white", "brown"] },
    { id: "wrap", name: "Turkey wrap", aliases: ["wrap"], kcal: 390, protein: 24, carbs: 38, fat: 15, grams: 220, serving: "1 wrap", tags: ["brown", "green"] },
    { id: "salmon-bowl", name: "Salmon rice bowl", aliases: [], kcal: 510, protein: 34, carbs: 48, fat: 18, grams: 380, serving: "1 bowl", tags: ["orange", "white", "green"] }
  ];

  const PLATE_SIZES = [
    { id: "7", label: "7 in plate", hint: "Side / kids", scale: 0.7 },
    { id: "9", label: "9 in plate", hint: "Standard lunch", scale: 1 },
    { id: "11", label: "11 in plate", hint: "Dinner plate", scale: 1.3 },
    { id: "13", label: "13 in platter", hint: "Sharing / large", scale: 1.65 },
    { id: "bowl", label: "Bowl", hint: "Soups, rice, oatmeal", scale: 0.9 }
  ];

  const MEAL_SLOTS = [
    { id: "breakfast", label: "Breakfast", start: 5, end: 10 },
    { id: "lunch", label: "Lunch", start: 11, end: 15 },
    { id: "dinner", label: "Dinner", start: 16, end: 21 },
    { id: "snack", label: "Snack", start: 0, end: 24 }
  ];

  const EQUIPMENT = [
    {
      id: "treadmill",
      name: "Treadmill",
      aliases: ["run", "walk belt"],
      muscles: ["Calves", "Quads", "Glutes", "Cardio"],
      difficulty: "Beginner",
      kcalPerMin: 8,
      minutes: 20,
      summary: "Walk or jog in place without guessing outdoor pace.",
      steps: [
        "Clip the safety key to your shirt and stand on the side rails first.",
        "Start at 2.0–2.5 mph. Step on only after the belt is moving slowly.",
        "Stand tall, look forward, and keep a light hold on the rails for the first minute.",
        "Raise speed or a 1–2% incline once your breathing feels steady.",
        "Cool down 2 minutes at a walk, then stop the belt before you step off."
      ],
      mistakes: ["Jumping on a fast belt", "Holding rails the whole time", "Stopping the belt while still walking on it"]
    },
    {
      id: "bike",
      name: "Stationary bike",
      aliases: ["spin bike", "cycle"],
      muscles: ["Quads", "Hamstrings", "Glutes", "Cardio"],
      difficulty: "Beginner",
      kcalPerMin: 7,
      minutes: 15,
      summary: "Low-impact cardio you can start the first gym day.",
      steps: [
        "Set the seat so your knee stays slightly bent at the bottom of the pedal stroke.",
        "Strap or clip in loosely. Hold the bars without shrugging your shoulders.",
        "Pedal at an easy pace for 2 minutes, then add resistance until talking feels a little harder.",
        "Keep a smooth circle, not a stomp. Sit tall if you feel lower-back rounding.",
        "Finish with 2 easy minutes and wipe the handles."
      ],
      mistakes: ["Seat too low", "Max resistance on day one", "Hunching over the console"]
    },
    {
      id: "elliptical",
      name: "Elliptical",
      aliases: ["cross trainer"],
      muscles: ["Quads", "Glutes", "Back", "Cardio"],
      difficulty: "Beginner",
      kcalPerMin: 7,
      minutes: 15,
      summary: "A running motion without the joint pounding.",
      steps: [
        "Step on when the pedals are still. Hold the moving handles.",
        "Start at resistance 3–5. Drive through the whole foot, not just the toes.",
        "Stand upright. Let the handles move your arms; do not lean all your weight on them.",
        "After 3 minutes, raise resistance or incline one notch.",
        "Slow down before you step off backward onto the floor."
      ],
      mistakes: ["Leaning on the rails", "Tiny shuffling steps", "Jumping off at speed"]
    },
    {
      id: "rower",
      name: "Rowing machine",
      aliases: ["erg", "concept2"],
      muscles: ["Back", "Legs", "Arms", "Cardio"],
      difficulty: "Beginner",
      kcalPerMin: 9,
      minutes: 10,
      summary: "Full-body cardio if you learn the legs-then-arms order.",
      steps: [
        "Strap the feet. Sit tall with a straight back.",
        "Drive with the legs first, then lean back slightly, then pull the handle to the lower ribs.",
        "Return in reverse: arms, then torso, then knees bend.",
        "Keep strokes smooth. A 2:1 recover-to-drive rhythm is plenty.",
        "Stop by slowing the cadence, then rack the handle."
      ],
      mistakes: ["Pulling with the arms first", "Rounding the back", "Yanking every stroke"]
    },
    {
      id: "leg-press",
      name: "Leg press",
      aliases: ["sled"],
      muscles: ["Quads", "Glutes", "Hamstrings"],
      difficulty: "Beginner",
      kcalPerMin: 5,
      minutes: 8,
      summary: "A supported squat pattern so you can learn leg strength safely.",
      steps: [
        "Sit back with your whole back and hips on the pad.",
        "Place feet mid-platform, about shoulder width. Toes slightly out.",
        "Unlock the safeties. Lower until knees are near 90 degrees. Do not bounce.",
        "Press through mid-foot until legs are long but not snapped straight.",
        "Re-lock the safeties before you get off."
      ],
      mistakes: ["Feet too high or too low", "Locking knees hard", "Letting hips lift off the pad"]
    },
    {
      id: "chest-press",
      name: "Chest press machine",
      aliases: ["bench press machine"],
      muscles: ["Chest", "Triceps", "Shoulders"],
      difficulty: "Beginner",
      kcalPerMin: 4,
      minutes: 8,
      summary: "A guided push so you can train chest without a spotter.",
      steps: [
        "Set the seat so handles sit at mid-chest.",
        "Keep shoulder blades on the pad. Grip the handles and brace your midsection.",
        "Press out until elbows are almost straight, then return with control.",
        "Exhale on the press. Do not shrug the shoulders up.",
        "Choose a weight you can move for 8–12 smooth reps."
      ],
      mistakes: ["Seat too high", "Flaring elbows to 90 degrees", "Bouncing the stack"]
    },
    {
      id: "lat-pulldown",
      name: "Lat pulldown",
      aliases: ["pulldown", "lat machine"],
      muscles: ["Lats", "Biceps", "Upper back"],
      difficulty: "Beginner",
      kcalPerMin: 4,
      minutes: 8,
      summary: "The beginner path to a pull-up pattern.",
      steps: [
        "Adjust the thigh pad so your legs stay down.",
        "Grip the bar slightly wider than shoulders. Sit tall.",
        "Pull the bar to the top of your chest. Drive elbows down, not behind you.",
        "Pause one beat, then let the bar rise without losing your seated posture.",
        "Stop the set if you start swinging your torso."
      ],
      mistakes: ["Pulling behind the neck", "Using too much body English", "Half reps at the top"]
    },
    {
      id: "seated-row",
      name: "Seated cable row",
      aliases: ["row machine"],
      muscles: ["Mid-back", "Biceps", "Rear shoulders"],
      difficulty: "Beginner",
      kcalPerMin: 4,
      minutes: 8,
      summary: "Teaches you to row without rounding the lower back.",
      steps: [
        "Sit with feet on the plate and a soft bend in the knees.",
        "Hold the handle, sit tall, and start with arms long.",
        "Pull the handle to your belly. Squeeze the shoulder blades together.",
        "Return until arms are long, but do not collapse the chest.",
        "Keep the same torso angle. This is not a sit-up."
      ],
      mistakes: ["Rocking the torso", "Shrugging to the ears", "Rounding the low back"]
    },
    {
      id: "shoulder-press",
      name: "Shoulder press machine",
      aliases: ["ohp", "overhead press"],
      muscles: ["Shoulders", "Triceps"],
      difficulty: "Beginner",
      kcalPerMin: 4,
      minutes: 7,
      summary: "Overhead strength with a backrest so the path stays honest.",
      steps: [
        "Set the seat so handles start near your ears, not above your head.",
        "Keep ribs down and low back against the pad.",
        "Press up until arms are long, then lower to ear height.",
        "Do not slam the plates. Pause if your neck juts forward.",
        "Start light. Shoulders fatigue faster than they look."
      ],
      mistakes: ["Arching off the pad", "Starting with handles too high", "Locking elbows aggressively"]
    },
    {
      id: "leg-curl",
      name: "Seated or lying leg curl",
      aliases: ["hamstring curl"],
      muscles: ["Hamstrings"],
      difficulty: "Beginner",
      kcalPerMin: 3,
      minutes: 6,
      summary: "Isolates the back of the thigh so squats feel more balanced.",
      steps: [
        "Line the pad just above the heels / lower calf.",
        "Hold the handles. Curl the pad toward you without lifting the hips.",
        "Squeeze at the end, then return slowly.",
        "Keep ankles relaxed. Do not point the toes hard.",
        "If the stack slams, the weight is too heavy."
      ],
      mistakes: ["Hips lifting", "Using momentum", "Pad sitting on the Achilles"]
    },
    {
      id: "leg-extension",
      name: "Leg extension",
      aliases: [],
      muscles: ["Quads"],
      difficulty: "Beginner",
      kcalPerMin: 3,
      minutes: 6,
      summary: "A simple quad finisher after the leg press.",
      steps: [
        "Align the knee with the machine’s pivot. Pad sits on the shin, not the ankle bone.",
        "Hold the handles and extend until the legs are long but comfortable.",
        "Lower in 2–3 seconds. Do not drop the stack.",
        "Stay seated — do not rock to finish the last reps.",
        "Use a moderate weight. This is not a max-out machine."
      ],
      mistakes: ["Seat too far back", "Kicking explosively", "Hyperextending the knees"]
    },
    {
      id: "cable-crossover",
      name: "Cable crossover",
      aliases: ["cable fly"],
      muscles: ["Chest"],
      difficulty: "Intermediate",
      kcalPerMin: 4,
      minutes: 7,
      summary: "Chest fly pattern with a stable, adjustable line.",
      steps: [
        "Set both pulleys high. Take a split stance in the middle.",
        "Start with a soft elbow bend. Bring the handles together in front of the chest.",
        "Return until you feel a stretch, not a shoulder pinch.",
        "Keep the same elbow angle the whole time.",
        "Step closer to the stacks if the weight pulls you forward."
      ],
      mistakes: ["Straight locked elbows", "Shrugging", "Using a walk-forward lunge each rep"]
    },
    {
      id: "smith-squat",
      name: "Smith machine squat",
      aliases: ["smith squat"],
      muscles: ["Quads", "Glutes"],
      difficulty: "Beginner",
      kcalPerMin: 5,
      minutes: 8,
      summary: "A guided squat so you can learn depth without balancing a free bar.",
      steps: [
        "Set the bar on your upper back, not the neck. Unrack by rotating the hooks.",
        "Feet slightly forward of the bar. Sit the hips down and back.",
        "Keep the chest up. Knees track over the toes.",
        "Stand up by pressing the floor away. Re-hook at the top.",
        "Start with the empty bar until the path feels familiar."
      ],
      mistakes: ["Bar on the neck", "Feet directly under the bar", "Bouncing out of the bottom"]
    },
    {
      id: "assisted-pullup",
      name: "Assisted pull-up",
      aliases: ["assisted chin up", "gravitron"],
      muscles: ["Lats", "Biceps"],
      difficulty: "Beginner",
      kcalPerMin: 5,
      minutes: 6,
      summary: "Lets you practice a real pull-up with help from the counterweight.",
      steps: [
        "Select a helpful counterweight — more assistance for your first sets.",
        "Kneel or stand on the pad. Grip the handles and start from a dead hang with packed shoulders.",
        "Pull your chest toward the handles. Pause, then lower slowly.",
        "Stop if you start kipping.",
        "Reduce assistance over weeks, not in one session."
      ],
      mistakes: ["Too little assistance on day one", "Chin-tucking without moving the back", "Dropping on the way down"]
    },
    {
      id: "hip-abductor",
      name: "Hip abductor",
      aliases: ["outer thigh machine"],
      muscles: ["Glutes", "Hip abductors"],
      difficulty: "Beginner",
      kcalPerMin: 3,
      minutes: 6,
      summary: "A simple machine for hip stability and gym confidence.",
      steps: [
        "Sit all the way back. Place the pads on the outside of the knees.",
        "Hold the handles. Open the knees against the pads with control.",
        "Pause, then return without letting the stack crash.",
        "Keep the torso still. This is a hip move, not a lean.",
        "Breathe out as you press out."
      ],
      mistakes: ["Leaning forward", "Tiny range of motion", "Maxing out the stack"]
    },
    {
      id: "stair-climber",
      name: "Stair climber",
      aliases: ["stairmaster", "stepmill"],
      muscles: ["Glutes", "Quads", "Cardio"],
      difficulty: "Beginner",
      kcalPerMin: 9,
      minutes: 10,
      summary: "Looks intense. Start slow and it is very learnable.",
      steps: [
        "Hold the rails lightly and start at the lowest level.",
        "Stand tall. Step onto the middle of each stair, whole foot.",
        "Do not lean your body weight on the console.",
        "After 3 minutes, raise one level if you can still speak a short sentence.",
        "Slow the stairs before you step off to the side."
      ],
      mistakes: ["Hinging on the rails", "Tiny tip-toe steps", "Starting on a high level"]
    },
    {
      id: "cable-face-pull",
      name: "Cable face pull",
      aliases: ["face pull"],
      muscles: ["Rear shoulders", "Upper back"],
      difficulty: "Beginner",
      kcalPerMin: 3,
      minutes: 6,
      summary: "A posture reset after desk hours.",
      steps: [
        "Set a rope at face height. Grab the ends with thumbs pointing back.",
        "Step back so the stack is off the bumper.",
        "Pull the rope toward your nose / forehead. Elbows high and wide.",
        "Rotate the hands so the knuckles go toward the ears.",
        "Return slowly. Keep the ribs down."
      ],
      mistakes: ["Turning it into a row to the belly", "Too much weight", "Head jutting forward"]
    },
    {
      id: "dumbbell-bench",
      name: "Dumbbell bench press",
      aliases: ["db bench"],
      muscles: ["Chest", "Triceps", "Shoulders"],
      difficulty: "Beginner",
      kcalPerMin: 5,
      minutes: 8,
      summary: "Free-weight press with an easier setup than a barbell.",
      steps: [
        "Sit with dumbbells on your thighs, then lie back and kick them into place.",
        "Wrists stacked over elbows. Feet on the floor.",
        "Lower until elbows are about 45 degrees from the torso.",
        "Press up without banging the bells together.",
        "To rack, sit up with the bells on your thighs. Do not drop them beside the bench."
      ],
      mistakes: ["Flaring elbows wide", "Bouncing off the chest", "Dropping weights from lockout"]
    },
    {
      id: "goblet-squat",
      name: "Goblet squat",
      aliases: ["dumbbell squat"],
      muscles: ["Quads", "Glutes", "Core"],
      difficulty: "Beginner",
      kcalPerMin: 6,
      minutes: 7,
      summary: "The most beginner-friendly squat if the Smith line is busy.",
      steps: [
        "Hold one dumbbell vertically at your chest. Elbows in.",
        "Feet about shoulder width. Sit down between the knees.",
        "Keep the chest proud and heels down.",
        "Stand up by pushing the floor away.",
        "If the heels lift, take a slightly wider stance."
      ],
      mistakes: ["Knees caving in", "Heels rising", "Looking down the whole set"]
    },
    {
      id: "plank",
      name: "Plank",
      aliases: ["front plank"],
      muscles: ["Core", "Shoulders"],
      difficulty: "Beginner",
      kcalPerMin: 3,
      minutes: 3,
      summary: "A no-equipment finisher you can do between machines.",
      steps: [
        "Elbows under shoulders, legs long, toes tucked.",
        "Make a straight line from head to heels. Squeeze glutes.",
        "Breathe. Do not hold a tense breath.",
        "If the hips pike or sag, drop to your knees and keep the same line.",
        "Start with 20–30 seconds, rest, repeat."
      ],
      mistakes: ["Hips too high", "Looking forward and craning the neck", "Holding 2 painful minutes on day one"]
    }
  ];

  const BADGES = [
    { id: "first-meal", name: "First plate", detail: "Log your first meal photo", icon: "🍽️" },
    { id: "first-gym", name: "Gym rookie", detail: "Finish one equipment tutorial", icon: "🏋️" },
    { id: "streak-3", name: "3-day spark", detail: "Log on 3 different days", icon: "🔥" },
    { id: "streak-7", name: "Week locked in", detail: "Hit a 7-day logging streak", icon: "⚡" },
    { id: "hydrate", name: "Hydrated", detail: "Reach your water goal once", icon: "💧" },
    { id: "balanced", name: "Both pillars", detail: "Log a meal and a workout on the same day", icon: "⚖️" },
    { id: "routine", name: "Plan on rails", detail: "Generate and complete a routine", icon: "🗺️" },
    { id: "social", name: "Challenge accepted", detail: "Join a friend challenge", icon: "🏁" }
  ];

  const FRIENDS = [
    { id: "maya", name: "Maya Chen", city: "San Jose", streak: 6, meals: 18, workouts: 5 },
    { id: "leo", name: "Leo Ramirez", city: "Oakland", streak: 4, meals: 14, workouts: 7 },
    { id: "priya", name: "Priya Shah", city: "Sunnyvale", streak: 8, meals: 21, workouts: 6 },
    { id: "sam", name: "Sam Okonkwo", city: "SF", streak: 2, meals: 9, workouts: 3 }
  ];

  const CHALLENGES = [
    { id: "log-7", name: "7-day log streak", detail: "Log at least one meal each day for a week.", days: 7, metric: "meals" },
    { id: "gym-3", name: "3 gym tutorials", detail: "Complete three machine tutorials this week.", days: 7, metric: "tutorials" },
    { id: "water-5", name: "Hydration workweek", detail: "Hit your water goal on 5 days.", days: 7, metric: "water" }
  ];

  const QUOTES = [
    "One photo is enough. You do not need a perfect day.",
    "Beginners who show up twice this week already beat last month.",
    "Machines look serious. The first minute is just setup.",
    "Busy days still count. Log the takeout. Then go walk."
  ];

  const XP = { set: 20, exercise: 50, workout: 150, meal: 25, withinTarget: 100, dailyGoal: 200 };

  const PERSONAS = [
    { id: "challenger", emoji: "🔥", name: "The Challenger", line: "Competition and ranks keep you honest.", focus: ["points", "circle", "streak"] },
    { id: "beginner", emoji: "🌱", name: "The Beginner", line: "Clear next steps. No shame. Machines explained.", focus: ["guide", "plan", "meals"] },
    { id: "builder", emoji: "💪", name: "The Builder", line: "Strength, protein, and progressive work.", focus: ["workout", "protein", "plan"] },
    { id: "balanced", emoji: "🧘", name: "The Balanced One", line: "Sustainable habits beat heroic weeks.", focus: ["recovery", "meals", "streak"] },
    { id: "consistency", emoji: "⚡", name: "The Consistency Seeker", line: "Show up. Log it. Tomorrow gets easier.", focus: ["streak", "meals", "plan"] }
  ];

  const GOALS = [
    { id: "lose", label: "Lose weight" },
    { id: "muscle", label: "Build muscle" },
    { id: "stronger", label: "Get stronger" },
    { id: "endurance", label: "Improve endurance" },
    { id: "healthy", label: "Stay healthy" },
    { id: "consistency", label: "Build consistency" }
  ];

  const EXERCISES = [
    { id: "shoulder-press-db", name: "Dumbbell Shoulder Press", muscles: ["Shoulders", "Triceps"], equipmentId: "shoulder-press", sets: 3, reps: 10, weight: 15, rest: 60 },
    { id: "lat-pulldown-ex", name: "Lat Pulldown", muscles: ["Lats", "Biceps"], equipmentId: "lat-pulldown", sets: 3, reps: 10, weight: 40, rest: 60 },
    { id: "chest-press-ex", name: "Chest Press", muscles: ["Chest", "Triceps"], equipmentId: "chest-press", sets: 3, reps: 10, weight: 35, rest: 60 },
    { id: "seated-row-ex", name: "Seated Row", muscles: ["Back", "Biceps"], equipmentId: "seated-row", sets: 3, reps: 10, weight: 40, rest: 60 },
    { id: "db-bench-ex", name: "Dumbbell Bench Press", muscles: ["Chest", "Shoulders"], equipmentId: "dumbbell-bench", sets: 3, reps: 8, weight: 20, rest: 75 },
    { id: "plank-ex", name: "Plank", muscles: ["Core"], equipmentId: "plank", sets: 3, reps: 30, weight: 0, rest: 45, unit: "sec" }
  ];

  const PEOPLE = [
    { id: "sarah", username: "sarahk", name: "Sarah Kim", streak: 12, points: 1640, workoutsWeek: 4, activity: "Logged lunch" },
    { id: "alex", username: "alexr", name: "Alex Rivera", streak: 5, points: 840, workoutsWeek: 3, activity: "Finished upper body" },
    { id: "maya", username: "mayachen", name: "Maya Chen", streak: 8, points: 1210, workoutsWeek: 5, activity: "5 workouts this week" },
    { id: "leo", username: "leorun", name: "Leo Ramirez", streak: 4, points: 720, workoutsWeek: 3, activity: "Rowed 10 min" },
    { id: "priya", username: "priyafit", name: "Priya Shah", streak: 9, points: 1500, workoutsWeek: 4, activity: "Hit protein target" }
  ];

  const DATA = { FOODS, PLATE_SIZES, MEAL_SLOTS, EQUIPMENT, BADGES, FRIENDS, CHALLENGES, QUOTES, XP, PERSONAS, GOALS, EXERCISES, PEOPLE };
  root.CC_DATA = DATA;
  if (typeof module !== "undefined" && module.exports) module.exports = DATA;
})(typeof globalThis !== "undefined" ? globalThis : this);
