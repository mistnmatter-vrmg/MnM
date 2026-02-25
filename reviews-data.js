// Load reviews from API only (no static fallback)
async function loadProductReviews(productName){
  const rl=document.getElementById('reviewsList');
  const rc=document.getElementById('pdReviewCount');
  
  try{
    const res=await fetch(`${window.API_BASE||'https://mnm-orders-api.mistnmatter.workers.dev'}/api/reviews?product=${encodeURIComponent(productName)}`);
    const data=await res.json();
    
    if(data.success && data.reviews){
      const reviews=data.reviews;
      const count=reviews.length;
      
      // Update drawer count
      if(rc)rc.textContent=`(${count} Reviews)`;
      
      // Update product card count
      const cards=document.querySelectorAll('.product-card');
      cards.forEach(card=>{
        if(card.dataset.name===productName){
          const ratingSpan=card.querySelector('.rating span:last-child');
          if(ratingSpan)ratingSpan.textContent=`(${count} Reviews)`;
        }
      });
      
      // Render reviews
      if(rl){
        if(count===0){
          rl.innerHTML='<p style="text-align:center;color:#999;padding:20px;">No reviews yet!</p>';
        }else{
          let h='';
          reviews.forEach(r=>{
            const s='⭐'.repeat(r.rating);
            const d=new Date(r.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
            h+=`<div style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:12px;background:#fff;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><strong style="font-size:14px;">${r.user_name}</strong><span style="color:#fbbf24;">${s}</span></div><p style="font-size:13px;color:#666;margin-bottom:6px;">${r.review_text}</p><div style="font-size:11px;color:#999;">${d}</div></div>`;
          });
          rl.innerHTML=h;
        }
      }
    }
  }catch(e){
    console.error('Error loading reviews:',e);
    if(rc)rc.textContent='(0 Reviews)';
    if(rl)rl.innerHTML='<p style="text-align:center;color:#999;padding:20px;">Unable to load reviews</p>';
  }
}

function scrollToReviews(e){
  e.preventDefault();
  const rs=document.getElementById('reviews');
  if(rs)rs.scrollIntoView({behavior:'smooth',block:'start'});
}

window.loadProductReviews=loadProductReviews;
window.scrollToReviews=scrollToReviews;
