/** Decorative, original vector landscape. No external image request or animation. */
export default function PastureScene({className=""}:{className?:string}){
 return <svg className={"wt-pasture "+className} viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMax slice">
  <path fill="#d5eee5" d="M0 0h1200v300H0z"/>
  <circle cx="929" cy="66" r="35" fill="#fff6cb"/>
  <path fill="#a4c7c5" d="m0 170 160-97 104 62L424 11l177 137 149-74 173 97 151-72 126 66v135H0z"/>
  <path fill="#79a9ac" d="m424 11-52 136 82-45 64 51 83-5-177-137ZM750 74l-23 78 53-20 52 55 91-16L750 74ZM160 73l-28 102 65-33 67-7L160 73Z"/>
  <path fill="#286273" d="M0 155c145-24 217 64 359 35 142-30 185-54 327-23s276-21 514-8v141H0Z"/>
  <path fill="#91ad67" d="M0 235c184-29 240-59 419-38 188 22 400 103 781-21v124H0Z"/>
  <path fill="#b9ca80" d="M411 196c64 8 139 25 204 41L404 300H216l195-104ZM658 246l105 9-98 45H495l163-54ZM941 245l130-33 129 88H928l13-55Z"/>
  <path fill="#ddbd4e" d="M1200 185c-66 19-104 39-138 56-43 23-44 43-35 59h76c-37-20-35-31-3-52 26-17 57-32 100-45v-18Z"/>
  <g transform="translate(825 152)"><path fill="#eeae6d" d="M0 38h89v72H0z"/><path fill="#d56247" d="m-12 42 57-43 58 43H-12Z"/><path fill="#fff0c7" d="M29 62h33v48H29z"/><path fill="#427481" d="M33 67h25v43H33z"/><path d="M45 67v43" stroke="#fff0c7" strokeWidth="3"/></g>
  <g stroke="#fff2d2" strokeWidth="3"><path d="M48 220h243M48 232h243M63 211v35m41-35v31m41-37v31m41-37v30m41-36v30m41-34v30"/></g>
  {[{x:332,y:249,s:1},{x:535,y:251,s:.75},{x:736,y:269,s:.85},{x:101,y:277,s:.65}].map(({x,y,s})=><g key={x} transform={`translate(${x} ${y}) scale(${s})`}><ellipse cy="18" rx="33" ry="5" fill="#315b50" opacity=".18"/><path d="M-16 6v16M15 6v16" stroke="#234b4c" strokeWidth="6" strokeLinecap="round"/><ellipse cy="-2" rx="30" ry="18" fill="#fff8df"/><circle cx="-13" cy="-15" r="10" fill="#fff8df"/><circle cx="3" cy="-17" r="10" fill="#fff8df"/><circle cx="19" cy="-12" r="10" fill="#fff8df"/><ellipse cx="29" cy="0" rx="10" ry="13" fill="#244d50"/><path d="m32-10 11-5" stroke="#244d50" strokeWidth="6" strokeLinecap="round"/><circle cx="33" cy="-2" r="1.5" fill="#fff8df"/></g>)}
  <path fill="#0a3d49" d="M0 280c20-31 28-30 39-5 15-44 36-42 44 7 18-16 29-13 44 18H0v-20ZM1110 300c8-32 29-52 41-12 10-48 35-48 49-27v39h-90Z"/>
 </svg>;
}
