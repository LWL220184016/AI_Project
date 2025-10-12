// import React, { useEffect, useState } from "react";

// function UploadFile({ comId, setImageName, type }) { // imageName here because release recipe needs to be uploaded it to database
//   const [imageName, setImageName2] = useState('');
//   // const [imageName, setImageName2] = useState(generateRandomString(15));

//   useEffect(() => {
//     const element = document.getElementById(comId);
//     if (element) {
//       const handleClick = function () {
//         const fileInput = document.getElementById('files');
//         const files = fileInput.files; // Get the files

//         if (files.length > 0) {
//           const apiUrl = process.env.REACT_APP_API_BASE_URL;
//           let img_count = 1;
//           Array.from(files).forEach((file, index) => {
//             const formData = new FormData();
//             formData.append('file', file, imageName + img_count + '.png'); // Append the file with imageName as filename
//             img_count++;

//             switch (type) {
//               case 'avatar':
//                 type = 'Avatar';
//                 break;
//               case 'recipe', 'recipe_step', 'recipe_ingredient':
//                 type = 'ReceipeImage';
//                 break;
//               default:
//             }

//             fetch(`${apiUrl}/api/upload${type}`, {
//               method: 'POST',
//               body: formData, // Send the FormData object directly
//               credentials: 'include',
//             })
//               .then(response => response.json())
//               .then(data => {
//                 console.log('Success:', data);
//               })
//               .catch((error) => {
//                 console.error('Error:', error);
//               });
//           });
//         };
//       }
//       element.addEventListener('click', handleClick);
//       return () => {
//         element.removeEventListener('click', handleClick);
//       };
//     }
//   }, [comId, imageName, type]);

//   const handleChange = (e) => {
//     console.log("files changed");
//     let imgName = '';
//     if (!imageName){ imgName = generateRandomString(15) }

//     if (type === 'recipe_step') {
//       imgName += '_step';
//     } else if (type === 'recipe_ingredient') {
//       imgName += '_ingredient';
//     }
//     setImageName(imgName);
//     setImageName2(imgName);
//   }

//   return (
//     <tr>
//       <td>
//         <input type="file" name="files" id="files" multiple onChange={handleChange} />
//       </td>
//     </tr>
//   )
// }

// function generateRandomString(length) {
//   let result = '';
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   const charactersLength = characters.length;
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

// export default UploadFile;
// export { generateRandomString };

// the following can only upload one file but everything is correct
// the above can upload multiple files but the image name is not correct

import React, { useEffect, useState } from "react";

function UploadFile({ comId, setImageName, type }) { // imageName here because release recipe needs to be uploaded it to database
  const [imageName, setImageName2] = useState(generateRandomString(15));

  useEffect(() => {
    const element = document.getElementById(comId);
    if (element) {
      const handleClick = function () {
        const fileInput = document.getElementById('file');
        const files = fileInput.files; // Get the file

        if (files.length > 0) {
          const formData = new FormData();
          let img_count = 1;
          Array.from(files).forEach((file, index) => {
            formData.append('file', file, imageName + img_count + '.png'); // Append the file with imageName as filename
            img_count++;
          });
          const apiUrl = process.env.REACT_APP_API_BASE_URL;

          switch (type) {
            case 'avatar':
              type = 'Avatar';
              break;
            case 'recipe':
              type = 'ReceipeImage';
              break;
            default:
          }

          fetch(`${apiUrl}/api/upload${type}`, {
            method: 'POST',
            body: formData, // Send the FormData object directly
            credentials: 'include',
          })
            .then(response => response.json())
            .then(data => {
              console.log('Success:', data);
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        };
      }
      element.addEventListener('click', handleClick);
      return () => {
        element.removeEventListener('click', handleClick);
      };
    }
  }, [comId, imageName, type]);

  const handleChange = (e) => {
    console.log("file changed");
    const imgName = generateRandomString(15)
    setImageName(imgName);
    setImageName2(imgName);
  }

  return (
    <tr>
      <td>
        <input type="file" name="file" id="file" multiple onChange={() => handleChange()} />
      </td>
    </tr>
  )
}

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default UploadFile;
export { generateRandomString };