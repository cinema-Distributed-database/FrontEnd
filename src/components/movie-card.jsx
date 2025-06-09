import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Film, Clock, Globe, Languages, PlayCircle } from 'lucide-react';

export default function MovieCard({ movie, city, cinemaId }) {
  const movieData = {
    ...movie,
    country: movie.country || 'Hàn Quốc',
  };

  const params = new URLSearchParams();
  if (city) {
    params.set('city', city);
  }
  if (cinemaId) {
    params.set('cinema', cinemaId);
  }
  const queryString = params.toString();
  const detailLink = `/movies/${movieData.id}${queryString ? `?${queryString}` : ''}`;

  return (
    <div className="group relative flex flex-col font-sans">
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <Link to={detailLink} className="block">
          <img
            src={movieData.poster || '/placeholder.svg'}
            alt={movieData.title}
            className="w-full h-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            style={{ aspectRatio: '2/3' }}
          />

          {movieData.ageRating && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold w-9 h-9 flex items-center justify-center rounded-md transition-opacity duration-300 group-hover:opacity-0">
              {movieData.ageRating}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-xl font-bold text-white mb-7 line-clamp-2 ">{movieData.title}</h3>

            <div className="space-y-1.5 text-xs text-gray-300 mb-20">
              <div className="flex items-center gap-2">
                <Film size={14} />
                <span>
                  {movieData.genres ? movieData.genres.join(', ') : 'Hành động, Phiêu lưu'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{movieData.duration} phút</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} />
                <span>{movieData.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Languages size={14} />
                <span>{movieData.subtitles}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-3 text-center">
        <h3
          className="text-sm font-semibold uppercase text-white truncate px-2"
          title={movieData.title}
        >
          {movieData.title}
        </h3>

        <div className="flex justify-center gap-2 mt-3">
          {movieData.trailer && (
            <a
              href={movieData.trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent h-9 px-3 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
            >
              <PlayCircle size={14} className="mr-1.5" />
              Xem Trailer
            </a>
          )}

          {!movieData.isComingSoon ? (
            <Link to={detailLink}>
              <Button
                size="sm"
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs px-5"
              >
                ĐẶT VÉ
              </Button>
            </Link>
          ) : (
            <Button size="sm" disabled className="bg-gray-600 text-gray-400 font-bold text-xs px-5">
              SẮP CHIẾU
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}