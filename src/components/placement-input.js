import React from 'react';

export const PlacementInput = (props)=>{
    const { id, setImgList } = props;

    const onSelect = (e)=>{
        const reader = new FileReader();
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        reader.readAsText(file);
        const file_name = file.name;
        reader.onload = () => {
            let readdata = [];
            try {
              readdata = JSON.parse(reader.result.toString());
            } catch (exception) {
              actions.setLoading(false);
              window.alert(exception);
              return;
            }
            setImgList(readdata)
        };
    };

    const onClick = (e)=>{
        setImgList([])
        e.target.value = '';
    };

    return (<>{React.useMemo(()=>
        <input type="file" accept=".json" id={id}
        onChange={onSelect} onClick={onClick} />,[])}</>)
}
