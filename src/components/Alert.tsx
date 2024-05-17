import '@styles/alert.css'



export interface AlertType {
    cStatus: number,
    msg: string
}

export interface AlertVariation {
    cStatus: number,
    jsx: React.ReactNode
}

export interface AlertComponentType {
    alert: AlertType,
    variations: AlertVariation[]
}

export function Alert({ alert, variations,  }: AlertComponentType) {
    const variation = variations.find(alertVar => (alertVar.cStatus===alert.cStatus));

    const status = parseInt(alert.cStatus.toString()[0]);
    const type = (status==2) ? 'success': 'error';

    return (
        <div className={`msg ${type}`}>
            {variation ? 
                <>{variation.jsx}</>
            :
                <p>{alert.msg}</p>
            }
        </div>
    );
}