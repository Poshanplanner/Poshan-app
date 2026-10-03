// Poshan meal ideas: Indian meal combinations built from foods.js.
// Each item: [food name in foods.js, servings, words shown after the amount, flexible range [min,max,step], amount multiplier].
// One item per meal may be flexible: Poshan changes its amount so the meal fits the person's calories.
// m: bf breakfast, sn snack (mid-morning and evening), lu lunch, di dinner. j: suitable for Jain diets (cooked without onion, garlic or root vegetables).
window.POSHAN_MEALIDEAS = [
// Breakfast
{m:'bf',j:1,items:[['Poha',1,'plate poha',[0.5,1.5,0.5]],['Curd / dahi',1,'katori curd']]},
{m:'bf',j:1,items:[['Upma',1,'plate upma',[0.5,1.5,0.5]],['Curd / dahi',1,'katori curd']]},
{m:'bf',j:1,items:[['Idli',3,'idli',[2,5,1]],['Sambar',1,'katori sambar'],['Coconut chutney',1,'tbsp coconut chutney',null,2]]},
{m:'bf',j:1,items:[['Besan chilla',2,'besan chilla',[1,3,1]],['Curd / dahi',1,'katori curd'],['Green chutney',1,'tbsp green chutney']]},
{m:'bf',j:1,items:[['Moong dal chilla',2,'moong dal chilla',[1,4,1]],['Green chutney',1,'tbsp green chutney']]},
{m:'bf',j:1,items:[['Oats with milk',1,'bowl oats cooked in milk',[1,1.5,0.5]],['Banana',1,'banana']]},
{m:'bf',items:[['Masala oats',1,'bowl masala oats'],['Boiled egg',2,'boiled eggs',[1,3,1]]]},
{m:'bf',items:[['Omelette (2 eggs)',1,'omelette (2 eggs)'],['Brown bread',2,'slices brown bread',[1,3,1]],['Tea with milk, no sugar',1,'cup tea, no sugar']]},
{m:'bf',j:1,items:[['Methi thepla',2,'methi thepla',[1,4,1]],['Curd / dahi',1,'katori curd']]},
{m:'bf',items:[['Paneer paratha',1,'paneer paratha',[1,2,1]],['Curd / dahi',1,'katori curd']]},
{m:'bf',j:1,items:[['Dalia',1,'katori vegetable dalia',[1,1.5,0.5]],['Almonds',1,'almonds',null,10]]},
{m:'bf',j:1,items:[['Plain dosa',2,'plain dosa',[1,3,1]],['Sambar',1,'katori sambar'],['Coconut chutney',1,'tbsp coconut chutney',null,2]]},
{m:'bf',items:[['Egg bhurji (2 eggs)',1,'serving egg bhurji (2 eggs)'],['Roti / chapati',2,'roti',[1,4,1]]]},
{m:'bf',items:[['Thalipeeth',1,'thalipeeth',[1,2,1]],['Curd / dahi',1,'katori curd']]},
{m:'bf',items:[['Sprouts salad',1,'katori sprouts salad'],['Brown bread',2,'slices brown bread',[1,3,1]],['Peanut butter',1,'tbsp peanut butter']]},
{m:'bf',j:1,items:[['Dhokla',1,'pieces dhokla',[1,2,0.5],2],['Green chutney',1,'tbsp green chutney'],['Milk, toned',1,'glass milk']]},

// Snacks (mid-morning and evening)
{m:'sn',j:1,items:[['Apple',1,'apple'],['Almonds',1,'almonds',null,10]]},
{m:'sn',j:1,items:[['Banana',1,'banana'],['Roasted chana',1,'g roasted chana',null,30]]},
{m:'sn',j:1,items:[['Buttermilk / chaas',1,'glass buttermilk'],['Roasted chana',1,'g roasted chana',null,30]]},
{m:'sn',items:[['Sprouts salad',1,'katori sprouts salad',[1,2,0.5]]]},
{m:'sn',j:1,items:[['Makhana, roasted',1,'g roasted makhana',[1,1.5,0.5],30],['Tea with milk, no sugar',1,'cup tea, no sugar']]},
{m:'sn',j:1,items:[['Greek yogurt',1,'g hung curd',[1,2,0.5],100],['Papaya',1,'cup papaya']]},
{m:'sn',items:[['Boiled egg',2,'boiled eggs',[1,3,1]],['Tea with milk, no sugar',1,'cup tea, no sugar']]},
{m:'sn',j:1,items:[['Dhokla',1,'pieces dhokla',[1,2,0.5],2],['Green chutney',1,'tbsp green chutney']]},
{m:'sn',j:1,items:[['Guava',1,'guava'],['Peanuts, roasted',0.5,'g roasted peanuts',[0.5,1,0.5],30]]},
{m:'sn',j:1,items:[['Milk, toned',1,'glass milk'],['Dates',1,'dates',null,2]]},
{m:'sn',j:1,items:[['Paneer',0.5,'g paneer, grilled',[0.5,1,0.25],100],['Green salad',1,'bowl salad']]},
{m:'sn',j:1,items:[['Coconut water',1,'glass coconut water'],['Walnuts',1,'walnut halves',null,4]]},
{m:'sn',items:[['Whey protein (in water)',1,'scoop whey protein in water'],['Banana',1,'banana']]},
{m:'sn',items:[['Tandoori chicken',1,'g tandoori chicken',[1,1.5,0.5],100],['Green salad',1,'bowl salad']]},
{m:'sn',j:1,items:[['Orange',1,'orange'],['Pumpkin seeds',1,'tbsp pumpkin seeds']]},

// Lunch
{m:'lu',j:1,items:[['Roti / chapati',2,'roti',[1,5,1]],['Dal tadka',1,'katori dal tadka'],['Mixed veg sabzi',1,'katori mixed veg sabzi'],['Curd / dahi',1,'katori curd'],['Green salad',1,'bowl salad']]},
{m:'lu',items:[['Rice, cooked (white)',1,'katori rice',[0.5,2.5,0.5]],['Toor dal (plain)',1,'katori toor dal'],['Bhindi fry',1,'katori bhindi'],['Green salad',1,'bowl salad']]},
{m:'lu',items:[['Jowar bhakri',2,'jowar bhakri',[1,4,1]],['Leafy sabzi (palak / methi)',1,'katori palak or methi sabzi'],['Masoor dal',1,'katori masoor dal'],['Buttermilk / chaas',1,'glass buttermilk']]},
{m:'lu',items:[['Rajma curry',1,'katori rajma'],['Rice, cooked (white)',1,'katori rice',[0.5,2.5,0.5]],['Green salad',1,'bowl salad']]},
{m:'lu',items:[['Chole / chana masala',1,'katori chole'],['Roti / chapati',2,'roti',[1,5,1]],['Curd / dahi',1,'katori curd'],['Green salad',1,'bowl salad']]},
{m:'lu',items:[['Roti / chapati',2,'roti',[1,5,1]],['Palak paneer',1,'katori palak paneer'],['Green salad',1,'bowl salad']]},
{m:'lu',items:[['Rice, cooked (white)',1,'katori rice',[0.5,2.5,0.5]],['Sambar',1,'katori sambar'],['Cabbage sabzi',1,'katori cabbage sabzi'],['Curd / dahi',1,'katori curd']]},
{m:'lu',items:[['Roti / chapati',2,'roti',[1,5,1]],['Soya chunks curry',1,'katori soya chunks curry'],['Lauki / dudhi sabzi',1,'katori lauki sabzi'],['Green salad',1,'bowl salad']]},
{m:'lu',j:1,items:[['Khichdi',1,'katori moong dal khichdi',[1,2.5,0.5]],['Curd / dahi',1,'katori curd'],['Green salad',1,'bowl salad']]},
{m:'lu',items:[['Bajra bhakri',2,'bajra bhakri',[1,4,1]],['Usal',1,'katori usal'],['Buttermilk / chaas',1,'glass buttermilk']]},
{m:'lu',items:[['Roti / chapati',2,'roti',[1,5,1]],['Chicken curry',1,'katori chicken curry'],['Green salad',1,'bowl salad']]},
{m:'lu',items:[['Rice, cooked (white)',1,'katori rice',[0.5,2.5,0.5]],['Fish curry',1,'katori fish curry'],['Cabbage sabzi',1,'katori cabbage sabzi']]},
{m:'lu',items:[['Roti / chapati',2,'roti',[1,5,1]],['Egg curry (2 eggs)',1,'katori egg curry (2 eggs)'],['Green salad',1,'bowl salad']]},
{m:'lu',j:1,items:[['Roti / chapati',2,'roti',[1,5,1]],['Chana dal',1,'katori chana dal'],['Gobi sabzi',1,'katori cabbage or capsicum sabzi'],['Curd / dahi',1,'katori curd']]},

// Dinner
{m:'di',j:1,items:[['Roti / chapati',2,'roti',[1,4,1]],['Moong dal',1,'katori moong dal'],['Mixed veg sabzi',1,'katori mixed veg sabzi'],['Green salad',1,'bowl salad']]},
{m:'di',items:[['Roti / chapati',2,'roti',[1,4,1]],['Paneer bhurji',1,'katori paneer bhurji'],['Green salad',1,'bowl salad']]},
{m:'di',j:1,items:[['Khichdi',1,'katori khichdi',[1,2.5,0.5]],['Kadhi',1,'katori kadhi']]},
{m:'di',items:[['Ragi roti',2,'ragi roti',[1,4,1]],['Chana dal',1,'katori chana dal'],['Gobi sabzi',1,'katori gobi sabzi']]},
{m:'di',j:1,items:[['Dalia',1,'katori vegetable dalia',[1,2,0.5]],['Curd / dahi',1,'katori curd'],['Green salad',1,'bowl salad']]},
{m:'di',items:[['Roti / chapati',2,'roti',[1,4,1]],['Tofu',1,'g tofu, cooked',[1,1.5,0.5],100],['Leafy sabzi (palak / methi)',1,'katori palak or methi sabzi']]},
{m:'di',items:[['Brown rice, cooked',1,'katori brown rice',[0.5,2.5,0.5]],['Dal tadka',1,'katori dal tadka'],['Green salad',1,'bowl salad']]},
{m:'di',items:[['Roti / chapati',2,'roti',[1,4,1]],['Chicken breast, cooked',1,'g chicken breast, cooked',[1,1.5,0.5],100],['Mixed veg sabzi',1,'katori mixed veg sabzi']]},
{m:'di',items:[['Roti / chapati',2,'roti',[1,4,1]],['Fish fry',1,'piece fish (100 g), tawa-cooked'],['Leafy sabzi (palak / methi)',1,'katori palak or methi sabzi']]},
{m:'di',items:[['Omelette (2 eggs)',1,'omelette (2 eggs)'],['Roti / chapati',2,'roti',[1,4,1]],['Mixed veg sabzi',1,'katori mixed veg sabzi']]},
{m:'di',items:[['Uttapam',1,'vegetable uttapam',[1,2,1]],['Sambar',1,'katori sambar']]},
{m:'di',j:1,items:[['Moong dal chilla',3,'moong dal chilla',[2,4,1]],['Curd / dahi',1,'katori curd']]},
{m:'di',items:[['Jowar bhakri',2,'jowar bhakri',[1,4,1]],['Baingan bharta',1,'katori baingan bharta'],['Masoor dal',1,'katori masoor dal']]}
];
