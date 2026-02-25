// Script to add fake reviews to database
const API_URL = 'https://mnm-orders-api.mistnmatter.workers.dev';

const fakeReviews = {
  "Royal Cotton Fabric Perfume": [
    {userName:"Priya Sharma",phone:"9876543210",rating:5,text:"Love the subtle cotton scent! Perfect for daily wear clothes."},
    {userName:"Amit Kumar",phone:"9876543211",rating:5,text:"Finally a fabric perfume that doesn't overpower. Lasts all day!"},
    {userName:"Sneha Mehta",phone:"9876543212",rating:4,text:"Good product. Wish it lasted a bit longer on thin fabrics."},
    {userName:"Rahul Patel",phone:"9876543213",rating:5,text:"Best purchase! My shirts smell fresh even after a full day."},
    {userName:"Anjali Desai",phone:"9876543214",rating:5,text:"Gentle fragrance, doesn't irritate my sensitive skin."},
    {userName:"Vikram Reddy",phone:"9876543215",rating:4,text:"Nice scent but could be stronger. Still worth the price."},
    {userName:"Meera Joshi",phone:"9876543216",rating:5,text:"Perfect for bedsheets! The whole room smells amazing."},
    {userName:"Karthik Nair",phone:"9876543217",rating:5,text:"Clean, fresh smell. Not artificial at all. Will buy again!"},
    {userName:"Shalini Bose",phone:"9876543218",rating:5,text:"Excellent quality! Worth every penny."},
    {userName:"Nikhil Tiwari",phone:"9876543219",rating:4,text:"Good for office wear. Colleagues compliment the freshness."},
    {userName:"Preeti Kapoor",phone:"9876543220",rating:5,text:"My go-to fabric spray now. Ordering second bottle!"},
    {userName:"Arun Menon",phone:"9876543221",rating:5,text:"Subtle and long-lasting. Perfect combination!"},
    {userName:"Riya Singh",phone:"9876543222",rating:4,text:"Nice product. Delivery was quick too."},
    {userName:"Sunil Pandey",phone:"9876543223",rating:5,text:"Best fabric perfume in this price range."},
    {userName:"Kavya Rao",phone:"9876543224",rating:5,text:"Love it! Using on all my clothes now."}
  ],
  "White Tea & Woods Fabric Perfume": [
    {userName:"Divya Lakshmi",phone:"9876543225",rating:5,text:"Absolutely love this! The woody notes are so calming."},
    {userName:"Arjun Malhotra",phone:"9876543226",rating:5,text:"Premium quality. Worth every rupee. My curtains smell luxurious!"},
    {userName:"Pooja Khanna",phone:"9876543227",rating:5,text:"Best fabric perfume I've tried. The tea scent is so soothing."},
    {userName:"Rohan Saxena",phone:"9876543228",rating:4,text:"Great for evening wear. Lasts longer than expected."},
    {userName:"Kavita Bhatt",phone:"9876543229",rating:5,text:"Elegant fragrance! Perfect for special occasions."},
    {userName:"Sanjay Thakur",phone:"9876543230",rating:5,text:"My wife loves it! Using it on all our premium fabrics."},
    {userName:"Nisha Gupta",phone:"9876543231",rating:5,text:"Sophisticated scent. Guests always ask what perfume I use!"},
    {userName:"Aditya Verma",phone:"9876543232",rating:4,text:"Good product. Slightly expensive but quality justifies it."}
  ],
  "Soft Cotton Cloud Fabric Perfume": [
    {userName:"Ritu Agarwal",phone:"9876543233",rating:5,text:"So gentle! Perfect for my baby's clothes."},
    {userName:"Manish Hegde",phone:"9876543234",rating:5,text:"Soft and comforting. Exactly what I was looking for!"},
    {userName:"Deepa Rao",phone:"9876543235",rating:4,text:"Nice mild fragrance. Good for sensitive fabrics."},
    {userName:"Suresh Pillai",phone:"9876543236",rating:5,text:"Best for daily use. Not too strong, not too weak. Perfect!"},
    {userName:"Lakshmi Nambiar",phone:"9876543237",rating:5,text:"Love how soft it makes my towels smell!"},
    {userName:"Rajesh Kulkarni",phone:"9876543238",rating:4,text:"Good value for money. Will repurchase."},
    {userName:"Swati Mishra",phone:"9876543239",rating:5,text:"Gentle on delicate fabrics. Highly satisfied!"}
  ],
  "Ivory Linen Fabric Perfume": [
    {userName:"Neha Sinha",phone:"9876543240",rating:5,text:"Elegant floral notes! Perfect for my linen sarees."},
    {userName:"Varun Dutta",phone:"9876543241",rating:5,text:"Premium quality. The fragrance is so refined!"},
    {userName:"Shreya Banerjee",phone:"9876543242",rating:4,text:"Beautiful scent. A bit pricey but worth it for special fabrics."},
    {userName:"Prakash Murthy",phone:"9876543243",rating:5,text:"My formal shirts smell amazing! Lasts the whole day."},
    {userName:"Anita Reddy",phone:"9876543244",rating:5,text:"Love the airy floral scent. Not overpowering at all."},
    {userName:"Gaurav Puri",phone:"9876543245",rating:5,text:"Best for luxury linens. Guests always compliment!"},
    {userName:"Priyanka Jain",phone:"9876543246",rating:4,text:"Good product. Wish it came in a larger bottle."}
  ]
};

async function addFakeReviews() {
  console.log('Starting to add fake reviews to database...');
  
  for (const [productName, reviews] of Object.entries(fakeReviews)) {
    console.log(`\nAdding reviews for ${productName}...`);
    
    for (const review of reviews) {
      try {
        const response = await fetch(`${API_URL}/api/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: productName,
            userPhone: review.phone,
            userName: review.userName,
            rating: review.rating,
            reviewText: review.text
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log(`✓ Added review by ${review.userName}`);
        } else {
          console.log(`✗ Failed: ${review.userName} - ${result.error}`);
        }
        
        // Wait 100ms between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error adding review for ${review.userName}:`, error);
      }
    }
  }
  
  console.log('\n✅ All fake reviews added to database!');
}

// Run the script
addFakeReviews();
