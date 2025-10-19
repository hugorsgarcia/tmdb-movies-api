import { Movie } from "@/types/movie";
import StarRating from "../StarRating";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export interface Props {
    movie: Movie;
    mediaType: 'movie' | 'tv';
}

const MovieCard = React.forwardRef<HTMLLIElement, Props>((props, ref) => {
    const { movie, mediaType } = props;
    const linkHref = `/${mediaType}/${movie.id}`;

    return (
        <li className="movie-card" ref={ref}>
            <div>
               <Image src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title}
                className="movie-poster" width={200} height={300} />
            </div>

            <div className="movie-infos">
                <p className="movie-title">
                    {movie.title}
                </p>
                <StarRating 
                    rating={movie.vote_average}
                />

                <div className="hidden-content">
                    <Link href={linkHref} className="btn-default">Ver mais</Link>
                    <div className="additional-content">
                        <p className="description">
                            {movie.overview}
                        </p>
                    </div>
                </div>
            </div>

            
        </li>
    );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;