import clsx from 'clsx';
import styles from '@styles/ui/alert.module.css';



const successAlert = clsx({
    [styles.msg] : true,
    [styles.success] : true
});
const errorAlert = clsx({
    [styles.msg] : true,
    [styles.error] : true
});



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

export function Alert({ alert, variations }: AlertComponentType) {
    const variation = variations.find(alertVar => (alertVar.cStatus===alert.cStatus));

    const status = parseInt(alert.cStatus.toString()[0]);
    const classes = (status==2) ? successAlert: errorAlert;

    return (
        <div className={classes}>
            {variation ? 
                <>{variation.jsx}</>
            :
                <p>{alert.msg}</p>
            }
        </div>
    );
}