import {FaStar} from "react-icons/fa6"
import {FaRegStar} from "react-icons/fa6"
import './index.scss'


export interface Props {
    rating: number;
}


export default function StarRating(props: Props) {

    const numStarts = Math.round(props.rating / 2);

    const fullstars = []
    const emptystars = []

    for (let i =0; i < 5; i++){
        if (i < numStarts) {
            fullstars.push(i)
        } else {
            emptystars.push(i)
        }
    }
            


    return(
        <div className="movie-rating">
            {fullstars.map(index => 
                <FaStar key={index} />
            )}
            {emptystars.map(index => 
                <FaRegStar key={index} />
            )}
        
        
        </div>
    )
}

