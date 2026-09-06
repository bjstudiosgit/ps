import { saveRegistration } from '@/lib/registrations';
export async function POST(request:Request){
 const headers={'Cache-Control':'no-store'};
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403,headers});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'JSON required'},{status:415,headers});
 try{
 const body=await request.text();
 if(body.length>2048)return Response.json({error:'Request too large'},{status:413,headers});
 const data=JSON.parse(body);
 if(data?.website)return Response.json({registered:true},{headers});
 const email=typeof data?.email==='string'?data.email.trim().toLowerCase():'';
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:'Invalid email'},{status:400,headers});
 await saveRegistration(email);
 return Response.json({registered:true},{headers});
 }catch(error){return Response.json({error:error instanceof SyntaxError?'Invalid request':'Registration unavailable'},{status:error instanceof SyntaxError?400:503,headers});}
}
