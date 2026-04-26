import { useState, useEffect } from 'react';
import CourseCard from '../../components/courses/CourseCard';
import { courseService } from '../../services/courseService';
import '@/styles/CourseView.css';

export default function Catalog({ showTitle = false }) {
    const [catalogCourses, setCatalogCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCatalog = async () => {
            setLoading(true);
            try {
                const data = await courseService.getCatalog();
                setCatalogCourses(data.courses || []);
            } catch (error) {
                console.error('Error al cargar catálogo:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCatalog();
    }, []);

    const handleEnroll = async (course) => {
        const token = localStorage.getItem('token');
        const result = await courseService.enrollInCourse(course.course_id, token);
        if (result.ok) {
            alert(`Matrícula exitosa en ${course.name}`);
            // Opcional: Recargar catálogo o redirigir
        } else {
            alert(result.message || 'Error en la matrícula');
        }
    };

    if (loading) {
        return <div>Cargando catálogo...</div>;
    }

    return (
        <div className="catalog-container">
            {showTitle && <h2 className="section-title">Catálogo de Cursos</h2>}
            <div className="course-grid">
                {catalogCourses.map(course => (
                    <CourseCard
                        key={course._id}
                        course={{ 
                            ...course, 
                            course_id: course._id,
                            name: course.courseName || course.course_name, 
                            code: course.courseCode || course.course_code, 
                            img: course.imageUrl || course.course_image_url || 'https://via.placeholder.com/300x150?text=No+Image'
                        }}
                        onAction={handleEnroll}
                    />
                ))}
                {catalogCourses.length === 0 && <p>No hay cursos disponibles en el catálogo.</p>}
            </div>
        </div>
    );
}
