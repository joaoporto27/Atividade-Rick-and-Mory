import styles from "../styles/CharacterCard.module.css"
import Image from "next/image"

export default  function CharacterCard({character, onClick }){
return (
    <div className={styles.card} onClick={onClick}>
    <Image 
        width={225} height={225}
        src={character.image}
        alt={character.name}
        className={styles.avatar}
        />
        <b>{character.name}</b>
        <p>{character.status}</p>
        <p>{character.species}</p>
        <p>{character.type || "Sem tipo"}</p>
        <p>{character.gender}</p>
        
    </div>
)
}