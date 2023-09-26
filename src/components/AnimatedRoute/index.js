import { motion } from "framer-motion";

const pageMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: .5 } },
    exit: { opacity: 0, y: 0, transition: { duration: .1 } }
};

const AnimatedRoute = (Component) => {
    return (props) => {
        return  <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageMotion}
          >  
            <Component {...props} />
        </motion.div>
    }
}

export default AnimatedRoute;