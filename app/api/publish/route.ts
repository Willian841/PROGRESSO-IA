import {NextResponse} from "next/server";

export async function POST(req:Request){
  try{
    const b=await req.json();
    const html=String(b.html||"");
    if(!html)return NextResponse.json({error:"Projeto vazio."},{status:400});

    const token=process.env.GITHUB_TOKEN;
    const repo=process.env.GITHUB_REPO||"Willian841/PROGRESSO-IA";

    if(!token){
      return NextResponse.json({
        mode:"local",
        message:"Projeto validado e pronto para publicação. Configure GITHUB_TOKEN no servidor para ativar a publicação automática."
      });
    }

    const [owner,name]=repo.split("/");
    if(!owner||!name)return NextResponse.json({error:"GITHUB_REPO inválido."},{status:500});

    const headers={
      Authorization:`Bearer ${token}`,
      Accept:"application/vnd.github+json",
      "X-GitHub-Api-Version":"2022-11-28"
    };

    const current=await fetch(
      `https://api.github.com/repos/${owner}/${name}/contents/index.html`,
      {headers,cache:"no-store"}
    );

    let sha:string|undefined;
    if(current.ok){
      const currentFile=await current.json();
      sha=currentFile.sha;
    }else if(current.status!==404){
      return NextResponse.json({error:"Não foi possível verificar o arquivo de publicação no GitHub."},{status:502});
    }

    const r=await fetch(
      `https://api.github.com/repos/${owner}/${name}/contents/index.html`,
      {
        method:"PUT",
        headers:{...headers,"Content-Type":"application/json"},
        body:JSON.stringify({
          message:"publish: site gerado pelo Progresso IA",
          content:Buffer.from(html).toString("base64"),
          ...(sha?{sha}:{}),
          branch:"main"
        })
      }
    );

    if(!r.ok){
      const details=await r.text().catch(()=>"");
      return NextResponse.json(
        {error:"GitHub recusou a publicação.",details:details.slice(0,300)},
        {status:502}
      );
    }

    return NextResponse.json({
      mode:"github",
      message:"Publicado no GitHub.",
      url:`https://${owner}.github.io/${name}/`
    });
  }catch{
    return NextResponse.json({error:"Erro durante a publicação."},{status:500});
  }
}