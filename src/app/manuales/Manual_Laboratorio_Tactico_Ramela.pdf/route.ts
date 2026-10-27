import { gunzipSync } from "node:zlib";
import p0 from "./pdf0";
import p1 from "./pdf1";
import p2 from "./pdf2";
import p3 from "./pdf3";
import p4 from "./pdf4";
import p5 from "./pdf5";
import p6 from "./pdf6";
import p7 from "./pdf7";
import p8 from "./pdf8";
import p9 from "./pdf9";
import p10 from "./pdf10";
import p11 from "./pdf11";
export function GET(){return new Response(gunzipSync(Buffer.from(p0+p1+p2+p3+p4+p5+p6+p7+p8+p9+p10+p11,"base64")),{headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="Manual_Laboratorio_Tactico_Ramela.pdf"',"Cache-Control":"public,max-age=3600"}});}
