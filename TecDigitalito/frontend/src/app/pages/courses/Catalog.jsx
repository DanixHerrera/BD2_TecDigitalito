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
                setCatalogCourses(data);
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
        if (result.success) {
            alert(`Matrícula exitosa en ${course.course_name}`);
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
                        key={course.course_id}
                        course={{ 
                            ...course, 
                            name: course.course_name, 
                            code: course.course_code, 
                            img: course.course_image_url 
                        }}
                        onAction={handleEnroll}
                    />
                ))}
                {catalogCourses.length === 0 && <p>No hay cursos disponibles en el catálogo.</p>}
            </div>
        </div>
    );
}
