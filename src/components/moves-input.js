import React from 'react';

export const MovesInput = (props)=>{
    const { actions, configLoad, id } = props;

    const onSelect = (e)=>{
        const reader = new FileReader();
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        actions.setLoading(true);
        actions.setMovesBase([]);
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
            if (!Array.isArray(readdata)) { // Not Array?
                const { movesbase } = readdata;
                if (!movesbase) {
                    actions.setLoading(false);
                    window.alert(i18n.formatError);
                    return;
                }
            }
            console.log({readdata})
            configLoad(readdata)
            actions.setInputFilename({ movesFileName: file_name });
            actions.setMovesBase(readdata);
            actions.setAnimatePause(true);
            actions.setLoading(false);
        };
    };

    const onClick = (e)=>{
        actions.setInputFilename({ movesFileName: null });
        actions.setMovesBase([]);
        e.target.value = '';
    };

    return (<>{React.useMemo(()=>
        <input type="file" accept=".json" id={id}
        onChange={onSelect} onClick={onClick} />,[])}</>)
}
