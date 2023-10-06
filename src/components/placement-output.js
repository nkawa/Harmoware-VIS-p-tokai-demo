import React from 'react';

export const PlacementOutput = (props)=>{
  const { getOutputData } = props;
  const onClick = ()=>{
      const saveData = getOutputData()
      console.log({saveData})
      if(saveData.length > 0){
        const resultJson = JSON.stringify(saveData);
        const downLoadLink = document.createElement("a");
        downLoadLink.download = 'arbitraryImagePlacementData-' + Date.now() + '.json';
        downLoadLink.href = URL.createObjectURL(new Blob([resultJson], {type: "text.plain"}));
        downLoadLink.dataset.downloadurl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
        downLoadLink.click();
      }
  }
  
  return (
      <button className='harmovis_button' onClick={onClick}><span>save</span></button>
  );
}
