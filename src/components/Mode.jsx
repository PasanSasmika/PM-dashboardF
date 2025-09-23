// import { useState } from 'react';

// const Mode = ({ theme, setTheme }) => {
//   const daisyThemes = [
//     'light','luxury'
//   ];

//   return (
//     <div className="p-4">
//     <h1 className="text-2xl font-bold mb-6">Choose a theme for your Recipe interface</h1>
//     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
//       {daisyThemes.map((themeName) => (
//         <button
//           key={themeName}
//           onClick={() => setTheme(themeName)}
//           className={`btn justify-start text-left capitalize
//             ${theme === themeName 
//               ? 'btn-primary' 
//               : 'btn-ghost bg-base-200 hover:bg-base-300'}
//           `}
//         >
//           {themeName.replace(/-/g, ' ')}
//         </button>
//       ))}
//     </div>
//   </div>
//   );
// };

// export default Mode;